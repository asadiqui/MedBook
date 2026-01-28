import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('register_user')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.connectedUsers.set(client.id, data.userId);
    console.log(`👤 User ${data.userId} registered with socket ${client.id}`);
    return { event: 'registered', data: { success: true } };
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

    if (!['PENDING', 'ACCEPTED'].includes(booking.status as any)) {
      return { event: 'error', data: { message: 'Chat is not allowed for this booking status' } };
    }

    const room = `booking_${data.bookingId}`;
    client.join(room);
    console.log(`👤 User ${socketUserId} joined room: ${room}`);

    return { event: 'joined_room', data: { room } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { bookingId: string },
  ) {
    const room = `booking_${data.bookingId}`;
    client.leave(room);
    console.log(`👤 Client ${client.id} left room: ${room}`);

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

      console.log(`📨 Message sent to room ${room}:`, savedMessage.content);

      return { event: 'message_sent', data: savedMessage };
    } catch (error) {
      console.error('Error sending message:', error);
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
      const updatedMessage = await this.chatService.markAsRead(data.messageId);

      const room = `booking_${data.bookingId}`;
      this.server.to(room).emit('message_read', updatedMessage);

      return { event: 'marked_read', data: updatedMessage };
    } catch (error) {
      console.error('Error marking message as read:', error);
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
      console.error('Error marking all messages as read:', error);
      return { event: 'error', data: { message: error.message } };
    }
  }
}
