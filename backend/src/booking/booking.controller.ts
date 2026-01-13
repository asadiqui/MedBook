import { Controller, Post,Patch , Param , Body, UseGuards, Get, Query } from '@nestjs/common';
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


  @UseGuards(JwtAuthGuard)
  @Get('patient')
  getPatientBookings(@CurrentUser('id') userId: string) {
    return this.bookingService.getPatientBookings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor')
  getDoctorBookings(@CurrentUser('id') userId: string) {
    return this.bookingService.getDoctorBookings(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('doctor/:id')
  getDoctorSchedule(
    @Param('id') doctorId: string,
    @Query('date') date: string | undefined,
    @CurrentUser() user,
  ) {
    return this.bookingService.getDoctorSchedule(doctorId, user, date);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  accept(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.acceptBooking(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.rejectBooking(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: { id: string; name: string }) {
    return this.bookingService.cancelBooking(id, user);
  }

  
}

