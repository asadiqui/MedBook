import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body('appointmentId', ParseIntPipe) appointmentId: number,
    @Body('senderId', ParseIntPipe) senderId: number,
    @Body('receiverId', ParseIntPipe) receiverId: number,
    @Body('content') content: string,
  ) {
    return this.chatService.saveMessage(
      appointmentId,
      senderId,
      receiverId,
      content,
    );
  }

  @Get('appointment/:id')
  async getHistory(@Param('id', ParseIntPipe) appointmentId: number) {
    return this.chatService.getAppointmentMessages(appointmentId);
  }

  @Get('conversation')
  async getConversation(
    @Query('user1', ParseIntPipe) user1: number,
    @Query('user2', ParseIntPipe) user2: number,
  ) {
    return this.chatService.getConversation(user1, user2);
  }

  @Post('read/:messageId')
  async markRead(@Param('messageId', ParseIntPipe) messageId: number) {
    return this.chatService.markAsRead(messageId);
  }
}
