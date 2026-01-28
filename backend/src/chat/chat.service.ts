import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CHAT_ALLOWED_BOOKING_STATUSES = ['PENDING', 'ACCEPTED'] as const;

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private assertChatAllowed(bookingStatus: string) {
    if (!CHAT_ALLOWED_BOOKING_STATUSES.includes(bookingStatus as any)) {
      throw new BadRequestException('Chat is not allowed for this booking status');
    }
  }

  async getBookingParticipants(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, doctorId: true, patientId: true, status: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async saveMessage(
    bookingId: string,
    senderId: string,
    receiverId: string,
    content: string,
  ) {
    // Verify the booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    this.assertChatAllowed(booking.status);

    // Verify sender and receiver exist
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new BadRequestException('User not found');
    }

    // Verify that both users are part of this booking
    const validParticipants = [booking.doctorId, booking.patientId];
    if (
      !validParticipants.includes(senderId) ||
      !validParticipants.includes(receiverId)
    ) {
      throw new BadRequestException('Users must be part of this booking');
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        bookingId,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return message;
  }

  async getBookingMessages(bookingId: string, requesterId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isParticipant = booking.doctorId === requesterId || booking.patientId === requesterId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not allowed to view this chat');
    }

    this.assertChatAllowed(booking.status);

    const messages = await this.prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return {
      booking,
      messages,
    };
  }

  async getConversation(currentUserId: string, otherUserId: string) {
    // Only allow conversation lookup when users share at least one active booking.
    const bookings = await this.prisma.booking.findMany({
      where: {
        status: { in: CHAT_ALLOWED_BOOKING_STATUSES as any },
        OR: [
          { doctorId: currentUserId, patientId: otherUserId },
          { doctorId: otherUserId, patientId: currentUserId },
        ],
      },
      select: { id: true },
    });

    if (bookings.length === 0) {
      throw new ForbiddenException('No booking exists between these users');
    }

    const bookingIds = bookings.map((b) => b.id);

    return this.prisma.message.findMany({
      where: {
        bookingId: { in: bookingIds },
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  async markAsRead(messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }

  async markAllAsRead(bookingId: string, userId: string) {
    const booking = await this.getBookingParticipants(bookingId);
    const isParticipant = booking.doctorId === userId || booking.patientId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not allowed to modify this chat');
    }

    await this.prisma.message.updateMany({
      where: {
        bookingId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async getUserChats(userId: string) {
    // Get all bookings where user is either doctor or patient
    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { doctorId: userId },
          { patientId: userId },
        ],
        status: { in: CHAT_ALLOWED_BOOKING_STATUSES as any },
      },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get unread count for each booking
    const chatsWithUnread = await Promise.all(
      bookings.map(async (booking) => {
        const unreadCount = await this.prisma.message.count({
          where: {
            bookingId: booking.id,
            receiverId: userId,
            isRead: false,
          },
        });

        const otherUser = booking.doctorId === userId ? booking.patient : booking.doctor;
        const lastMessage = booking.messages[0] || null;

        return {
          bookingId: booking.id,
          otherUser,
          lastMessage,
          unreadCount,
          bookingDate: booking.date,
          bookingStatus: booking.status,
        };
      }),
    );

    return chatsWithUnread;
  }
}
