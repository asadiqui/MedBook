import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SendMessageDto } from './dto';

const chatUploadStorage = diskStorage({
  destination: './uploads/chat',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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

  @Post('send-attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: chatUploadStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async sendAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body('bookingId') bookingId: string,
    @Body('receiverId') receiverId: string,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileUrl = `/uploads/chat/${file.filename}`;
    const content = `[attachment:${fileUrl}:${file.originalname}:${file.mimetype}]`;

    return this.chatService.saveMessage(bookingId, userId, receiverId, content);
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
