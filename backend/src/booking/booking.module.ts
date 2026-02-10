import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from "../notifications/notifications.module";
import { ChatModule } from '../chat/chat.module';


@Module({
  imports: [PrismaModule, NotificationsModule, ChatModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}