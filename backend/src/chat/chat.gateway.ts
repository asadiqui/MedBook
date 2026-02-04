import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { BookingStatus } from '@prisma/client';

const chatCorsOrigin = (process.env.FRONTEND_URL || 'https://localhost:8443')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Only allow chat for ACCEPTED bookings
const CHAT_ALLOWED_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.ACCEPTED,
];

@WebSocketGateway({
  cors: {
    origin: chatCorsOrigin.length === 1 ? chatCorsOrigin[0] : chatCorsOrigin,
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  // Map socketId -> userId
  private connectedUsers: Map<string, string> = new Map();
  // Map userId -> Set of socketIds (a user can have multiple tabs/devices)
  private onlineUsers: Map<string, Set<string>> = new Map();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    
    // Remove this socket from user's online set
    if (userId) {
      const userSockets = this.onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.onlineUsers.delete(userId);
          // Broadcast that user went offline
          this.server.emit('user_status', { userId, isOnline: false });
          this.logger.log(`User ${userId} is now offline`);
        }
      }
    }
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.connectedUsers.set(client.id, data.userId);
    
    // Track online status
    if (!this.onlineUsers.has(data.userId)) {
      this.onlineUsers.set(data.userId, new Set());
    }
    this.onlineUsers.get(data.userId)!.add(client.id);
    
    // Broadcast that user is online
    this.server.emit('user_status', { userId: data.userId, isOnline: true });
    
    this.logger.log(`User ${data.userId} registered with socket ${client.id}`);
    return { event: 'registered', data: { success: true } };
  }

  @SubscribeMessage('get_online_status')
  handleGetOnlineStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userIds: string[] },
  ) {
    const statuses: Record<string, boolean> = {};
    for (const userId of data.userIds) {
      statuses[userId] = this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
    }
    return { event: 'online_statuses', data: statuses };
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; userId: string },
  ) {
    const socketUserId = this.connectedUsers.get(client.id) || data.userId;

    const booking = await this.chatService.getBookingParticipants(data.bookingId);
    const isParticipant = booking.doctorId === socketUserId || booking.patientId === socketUserId;
    if (!isParticipant) {
      return { event: 'error', data: { message: 'Not allowed to join this room' } };
    }

    if (!CHAT_ALLOWED_BOOKING_STATUSES.includes(booking.status as BookingStatus)) {
      return { event: 'error', data: { message: 'Chat is not allowed for this booking status' } };
    }

    const room = `booking_${data.bookingId}`;
    client.join(room);
    this.logger.log(`User ${socketUserId} joined room: ${room}`);

    return { event: 'joined_room', data: { room } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    const room = `booking_${data.bookingId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);

    return { event: 'left_room', data: { room } };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      bookingId: string;
      senderId?: string;
      receiverId?: string;
      content: string;
    },
  ) {
    try {
      const senderId = this.connectedUsers.get(client.id) || data.senderId;
      if (!senderId) {
        return { event: 'error', data: { message: 'Sender not registered' } };
      }

      const booking = await this.chatService.getBookingParticipants(data.bookingId);
      const isParticipant = booking.doctorId === senderId || booking.patientId === senderId;
      if (!isParticipant) {
        return { event: 'error', data: { message: 'Not allowed to send to this booking' } };
      }

      const receiverId = booking.doctorId === senderId ? booking.patientId : booking.doctorId;

      const savedMessage = await this.chatService.saveMessage(
        data.bookingId,
        senderId,
        receiverId,
        data.content,
      );

      const room = `booking_${data.bookingId}`;
      this.server.to(room).emit('new_message', savedMessage);

      this.logger.log(`Message sent to room ${room}: ${savedMessage.content}`);

      return { event: 'message_sent', data: savedMessage };
    } catch (error) {
      this.logger.error(
        'Error sending message',
        error instanceof Error ? error.stack : `${error}`,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { bookingId: string; userId: string; isTyping: boolean },
  ) {
    const room = `booking_${data.bookingId}`;

    client.to(room).emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });

    return { event: 'typing_sent', data: { success: true } };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; bookingId: string },
  ) {
    try {
      const userId = this.connectedUsers.get(client.id);
      if (!userId) {
        return { event: 'error', data: { message: 'User not registered' } };
      }

      const updatedMessage = await this.chatService.markAsRead(data.messageId, userId);

      const room = `booking_${data.bookingId}`;
      this.server.to(room).emit('message_read', updatedMessage);

      return { event: 'marked_read', data: updatedMessage };
    } catch (error) {
      this.logger.error(
        'Error marking message as read',
        error instanceof Error ? error.stack : `${error}`,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('mark_all_read')
  async handleMarkAllRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string; userId: string },
  ) {
    try {
      await this.chatService.markAllAsRead(data.bookingId, data.userId);

      const room = `booking_${data.bookingId}`;
      this.server.to(room).emit('all_messages_read', {
        bookingId: data.bookingId,
        userId: data.userId,
      });

      return { event: 'all_marked_read', data: { success: true } };
    } catch (error) {
      this.logger.error(
        'Error marking all messages as read',
        error instanceof Error ? error.stack : `${error}`,
      );
      return { event: 'error', data: { message: error.message } };
    }
  }
}
