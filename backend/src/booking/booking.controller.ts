import { Controller, Post, Patch, Param, Body, Get, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  @Post()
  create(@Body() dto: CreateBookingDto, @CurrentUser('id') userId: string) {
    return this.bookingService.createBooking(dto, userId);
  }


  @Get('patient')
  getPatientBookings(@CurrentUser('id') userId: string) {
    return this.bookingService.getPatientBookings(userId);
  }

  @Get('doctor')
  getDoctorBookings(@CurrentUser('id') userId: string) {
    return this.bookingService.getDoctorBookings(userId);
  }

  @Get('doctor/:id')
  getDoctorSchedule(
    @Param('id') doctorId: string,
    @Query('date') date: string | undefined,
    @CurrentUser() user,
  ) {
    return this.bookingService.getDoctorSchedule(doctorId, user, date);
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

