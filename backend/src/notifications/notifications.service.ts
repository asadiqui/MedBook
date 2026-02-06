import { Injectable } from '@nestjs/common';        // 1) Import NestJS helper to make this class "injectable"
import { PrismaService } from '../prisma/prisma.service'; // 2) Import our DB helper (Prisma)
import { NotificationType } from '@prisma/client';  // 3) Import the enum from schema.prisma (BOOKING_CREATED, etc.)

// 4) This decorator tells NestJS: "You are allowed to inject this class into constructors"
@Injectable()
export class NotificationsService {
  // 5) Constructor injection:
  //    NestJS will automatically create ONE PrismaService instance and pass it here.
  //    'private readonly prisma' becomes a private member of the class.
  constructor(private readonly prisma: PrismaService) {}

  // 6) This function creates ONE notification row in the notifications table.
  //    'async' means it returns a Promise (because DB calls are asynchronous).
  async createNotification(
    userId: string,           // Who should get the notification (doctor/patient ID)
    type: NotificationType,   // What kind (BOOKING_CREATED, etc.)
    title: string,            // Short title for UI
    message: string,          // Longer text
    bookingId?: string,       // Optional: link to a booking
  ) {
    // 7) This is Prisma's "insert into notifications (...)".
    //    It maps directly to the Notification model you defined in schema.prisma.
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        bookingId,
      },
    });
  }
}