import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module'; // <-- add this

@Module({
  imports: [PrismaModule, NotificationsModule], // <-- include NotificationsModule here
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}