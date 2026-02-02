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
import { SendMessageDto } from './dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.saveMessage(
      dto.bookingId,
      userId,
      dto.receiverId,
      dto.content,
    );
  }

  @Get('booking/:id')
  async getHistory(
    @Param('id') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getBookingMessages(bookingId, userId);
  }

  @Get('conversation')
  async getConversation(
    @Query('user2') user2: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.getConversation(userId, user2);
  }

  @Post('read/:messageId')
  async markRead(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAsRead(messageId, userId);
  }

  @Post('read-all/:bookingId')
  async markAllRead(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.markAllAsRead(bookingId, userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.chatService.getUnreadCount(userId);
  }

  @Get('my-chats')
  async getUserChats(@CurrentUser('id') userId: string) {
    return this.chatService.getUserChats(userId);
  }
}
