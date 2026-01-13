import { Controller, Post,Patch , Param , Body, UseGuards } from '@nestjs/common';
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
  create(@Body() dto: CreateBookingDto, @CurrentUser('id') userId: string) {
    return this.bookingService.createBooking(dto, userId);
  }
  @Patch(':id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.acceptBooking(id, user);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.rejectBooking(id, user);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.cancelBooking(id, user);
  }
}

