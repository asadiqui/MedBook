import { Module } from '@nestjs/common';
import { AvailabilityModule } from './availability/availability.module';
import { BookingController } from './booking/booking.controller';
import { BookingService } from './booking/booking.service';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [AvailabilityModule, BookingModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class AppModule {}
