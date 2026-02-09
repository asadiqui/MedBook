import { Controller, Get, Patch, Param, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // If your service already has a "getNotificationsForUser" or similar,
  // we’ll switch to it. For now this calls a method we will add next.
  @Get()
  list(@CurrentUser('id') userId: string) {
    return this.service.getForUser(userId);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser('id') userId: string) {
    const unreadCount = await this.service.getUnreadCount(userId);
    return { unreadCount };
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  // TEMP endpoint to test creation quickly
  @Post('test')
  createTest(@CurrentUser('id') userId: string) {
    return this.service.createTest(userId);
  }
}
