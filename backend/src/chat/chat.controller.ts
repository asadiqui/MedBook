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
  forwardRef,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
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
  constructor(
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

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
          // Images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          // Text and code files
          'text/plain',
          'text/x-java-source',
          'text/x-java',
          'application/x-java',
          'text/javascript',
          'application/javascript',
          'text/typescript',
          'application/typescript',
          'text/x-python',
          'text/x-c',
          'text/x-c++',
          'text/html',
          'text/css',
          'application/json',
          'text/xml',
          'application/xml',
          'text/markdown',
          'text/x-sql',
          'application/x-sh',
          'text/yaml',
          'application/x-yaml',
          // Archives
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          // Fallback for code files that might have generic mime types
          'application/octet-stream',
        ];
        // Also check file extension for code files (browsers often send octet-stream)
        const allowedExtensions = ['.java', '.js', '.ts', '.jsx', '.tsx', '.py', '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rb', '.php', '.html', '.css', '.json', '.xml', '.md', '.sql', '.sh', '.yml', '.yaml', '.txt'];
        const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
        if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
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

    const savedMessage = await this.chatService.saveMessage(bookingId, userId, receiverId, content);
    
    // Emit the attachment message via WebSocket so receiver sees it immediately
    this.chatGateway.emitMessageToRoom(bookingId, savedMessage);
    
    return savedMessage;
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
