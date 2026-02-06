import { Module } from '@nestjs/common';               // 1) Import Module decorator (marks this class as a Nest module)
import { NotificationsService } from './notifications.service'; // 2) Import the service we just defined
import { PrismaModule } from '../prisma/prisma.module'; // 3) Import PrismaModule (so we can use PrismaService)

@Module({
  // 4) imports: other modules this one depends on.
  //    We need PrismaModule because NotificationsService uses PrismaService.
  imports: [PrismaModule],

  // 5) providers: the services this module creates and manages.
  //    "When someone needs NotificationsService, this module knows how to build it."
  providers: [NotificationsService],

  // 6) exports: what this module makes available to OTHER modules.
  //    By exporting NotificationsService, BookingModule (and others) can use it.
  exports: [NotificationsService],
})
export class NotificationsModule {}