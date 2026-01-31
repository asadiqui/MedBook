import { BadRequestException, Injectable , ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { timeConversion } from '../common/utils/time';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingService {

  constructor(private readonly prisma: PrismaService) {}
 
  async createBooking(dto: CreateBookingDto, patientId: string) {
    // Implementation for creating a booking

    let CheckDate = new Date(dto.date);
    const today = new Date();

    // Prevent creating bookings for past dates
    if (CheckDate < new Date(today.toDateString())) {
      throw new BadRequestException('Cannot create booking for past dates');
    }

    
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!user || user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can create bookings');
    }
    // get data from dto
    const { duration, startTime, reason } = dto;

    let endTimeStr: string;
    let durationMinutes: number;

    if (dto.endTime) {
      endTimeStr = dto.endTime;
      durationMinutes = timeConversion(endTimeStr) - timeConversion(startTime);
    } else {
      if (typeof duration !== 'number') {
        throw new BadRequestException('Either endTime or duration is required');
      }

      // legacy rule: duration is 60 or 120
      if (duration !== 60 && duration !== 120) {
        throw new BadRequestException('Duration must be 60 or 120 minutes');
      }

      durationMinutes = duration;
      const endTime = timeConversion(startTime) + durationMinutes;
      const endHours = Math.floor(endTime / 60);
      const endMinutes = endTime % 60;
      endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes
        .toString()
        .padStart(2, '0')}`;
    }

    if (durationMinutes <= 0) {
      throw new BadRequestException('Invalid time range');
    }

    // check availability exists & booking fits inside it

    const existingAvailabilities = await this.prisma.availability.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
      },
    });

    // check if any availability fits the booking

    if (existingAvailabilities.length === 0) {
      throw new BadRequestException('No availability found for this doctor on the selected date');
    }

    const bookingStart = timeConversion(startTime);
    const bookingEnd = timeConversion(endTimeStr);

    const bookingFitsInAvailability = existingAvailabilities.some((availability) => {
      const availabilityStart = timeConversion(availability.startTime);
      const availabilityEnd = timeConversion(availability.endTime);

      return (
        bookingStart >= availabilityStart &&
        bookingEnd <= availabilityEnd
      );
    });

    if (!bookingFitsInAvailability) {
      throw new BadRequestException('Booking time does not fit within doctor availability');
    }

    // check for overlapping bookings

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
        status: {
          not: 'CANCELLED',
        },
      },
    });

    for (const booking of existingBookings) {
      const existingStart = timeConversion(booking.startTime);
      const existingEnd = timeConversion(booking.endTime);

      const overlaps =
        bookingStart < existingEnd &&
        existingStart < bookingEnd;

      if (overlaps) {
        throw new BadRequestException('Time slot already booked');
      }
    }

    // If all checks pass, create the booking
    return this.prisma.booking.create({
      data: {
        doctorId: dto.doctorId,
        patientId: patientId,
        date: dto.date,
        startTime: startTime,
        endTime: endTimeStr,
        duration: durationMinutes,
        reason: reason?.trim() || null,
        status: 'PENDING',
      },
    });
  }

  async acceptBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can accept bookings');
    }

    if (booking.doctorId !== user.id) {
      throw new ForbiddenException('You are not authorized to accept this booking');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking is not in a pending state');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'ACCEPTED' },
    });
  }

  async rejectBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can reject bookings');
    }

    if (booking.doctorId !== user.id) {
      throw new ForbiddenException('You are not authorized to reject this booking');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Booking is not in a pending state');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'REJECTED' },
    });
  }

  async cancelBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const isPatient = booking.patientId === user.id;
    const isDoctor = booking.doctorId === user.id;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException('You are not authorized to cancel this booking');
    }

    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      throw new BadRequestException('Only pending or accepted bookings can be cancelled');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });
  }

  async getPatientBookings(patientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!user || user.role !== 'PATIENT') {
      throw new ForbiddenException('Only patients can view their bookings');
    }

    return this.prisma.booking.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            avatar: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getMyBookings(user: { id: string; role: string }) {
    if (user.role === 'PATIENT') {
      return this.getPatientBookings(user.id);
    }

    if (user.role === 'DOCTOR') {
      return this.getDoctorBookings(user.id);
    }

    throw new ForbiddenException('Only patients or doctors can view bookings');
  }

  async getDoctorBookings(doctorId: string, status?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!user || user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can view their bookings');
    }

    let parsedStatus: BookingStatus | undefined;
    if (status) {
      const upper = String(status).toUpperCase();
      const allowed: BookingStatus[] = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
      if (!allowed.includes(upper as BookingStatus)) {
        throw new BadRequestException('Invalid status filter');
      }
      parsedStatus = upper as BookingStatus;
    }

    return this.prisma.booking.findMany({
      where: {
        doctorId,
        ...(parsedStatus ? { status: parsedStatus } : {}),
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    });
  }

  async getDoctorSchedule(
    doctorId: string,
    user: { id: string; role: string },
    date?: string,
  ) {

    if (user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctors can view schedules');
    }


    if (doctorId !== user.id) {
      throw new ForbiddenException('You can only view your own schedule');
    }

    const where: any = {
      doctorId,
    };

    if (date) {
      where.date = date; // YYYY-MM-DD
    }


    return this.prisma.booking.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { startTime: 'asc' },
      ],
    });
  }
}