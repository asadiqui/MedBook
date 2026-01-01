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
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: number; userId: number },
  ) {
    const room = `appointment_${data.appointmentId}`;
    client.join(room);
    console.log(`👤 User ${data.userId} joined room: ${room}`);

    return { event: 'joined_room', data: { room } };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      appointmentId: number;
      senderId: number;
      receiverId: number;
      content: string;
    },
  ) {
    const savedMessage = await this.chatService.saveMessage(
      data.appointmentId,
      data.senderId,
      data.receiverId,
      data.content,
    );

    const room = `appointment_${data.appointmentId}`;
    this.server.to(room).emit('new_message', savedMessage);

    console.log(`📨 Message sent to room ${room}:`, savedMessage.content);

    return savedMessage;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { appointmentId: number; userId: number; isTyping: boolean },
  ) {
    const room = `appointment_${data.appointmentId}`;

    client.to(room).emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; appointmentId: number },
  ) {
    const updatedMessage = await this.chatService.markAsRead(data.messageId);

    const room = `appointment_${data.appointmentId}`;
    this.server.to(room).emit('message_read', updatedMessage);

    return updatedMessage;
  }
}
