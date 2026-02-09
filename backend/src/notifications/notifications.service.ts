import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Notification, NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';


export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly gateway: NotificationsGateway,
) {}


  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        body: createNotificationDto.body,
        data: createNotificationDto.data || null,
      },
    });
  }

  async getUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async delete(notificationId: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async deleteByUserId(userId: string): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return result.count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

    async getForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async createNotification(input: {
	userId: string;
	type: "BOOKING_STATUS" | "CHAT_MESSAGE" | "SYSTEM";
	title: string;
	body: string;
	data?: any;
	}) {
	const notification = await this.prisma.notification.create({
		data: {
		userId: input.userId,
		type: input.type,
		title: input.title,
		body: input.body,
		data: input.data,
		},
	});

  // emit live event
  this.gateway.emitToUser(input.userId, "notification", notification);

  return notification;
}


  async createTest(userId: string) {
	const notification = await this.prisma.notification.create({
		data: {
		userId,
		type: 'SYSTEM',
		title: 'Test notification',
		body: 'If you see this, notifications are working ✅',
		data: { source: 'POST /notifications/test' },
		},
	});

	// LIVE PUSH
	this.gateway.emitToUser(userId, 'notification', notification);

	return notification;
	}


}

