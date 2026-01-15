import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body('bookingId') bookingId: string,
    @Body('receiverId') receiverId: string,
    @Body('content') content: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.saveMessage(
      bookingId,
      user.userId,
      receiverId,
      content,
    );
  }

  @Get('booking/:id')
  async getHistory(@Param('id') bookingId: string) {
    return this.chatService.getBookingMessages(bookingId);
  }

  @Get('conversation')
  async getConversation(
    @Query('user1') user1: string,
    @Query('user2') user2: string,
  ) {
    return this.chatService.getConversation(user1, user2);
  }

  @Post('read/:messageId')
  async markRead(@Param('messageId') messageId: string) {
    return this.chatService.markAsRead(messageId);
  }

  @Post('read-all/:bookingId')
  async markAllRead(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.chatService.markAllAsRead(bookingId, user.userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: { userId: string }) {
    return this.chatService.getUnreadCount(user.userId);
  }

  @Get('my-chats')
  async getUserChats(@CurrentUser() user: { userId: string }) {
    return this.chatService.getUserChats(user.userId);
  }
}
