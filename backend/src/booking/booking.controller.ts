import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
    return this.bookingService.createBooking(dto, user.id);
  }
}