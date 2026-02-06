import { BadRequestException, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { timeConversion } from '../common/utils/time';
import { BookingStatus, Role, NotificationType } from '@prisma/client'; // <-- added NotificationType
import { NotificationsService } from '../notifications/notifications.service'; // <-- new import

const ALLOWED_DURATIONS = new Set([60, 120]);

@Injectable()
export class BookingService {

  constructor (
	private readonly prisma: PrismaService,
	private readonly notificationsService: NotificationsService, // <-- new dependency
	) {}

  async createBooking(dto: CreateBookingDto, patientId: string) {
    let CheckDate = new Date(dto.date);
    const today = new Date();

    if (CheckDate < new Date(today.toDateString())) {
      throw new BadRequestException('Cannot create availability for past dates');
    }


    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!user || user.role !== Role.PATIENT) {
      throw new ForbiddenException('Only patients can create bookings');
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
      select: { id: true, role: true, isActive: true, isVerified: true },
    });

    if (!doctor || doctor.role !== Role.DOCTOR || !doctor.isActive || !doctor.isVerified) {
      throw new BadRequestException('Selected doctor is not available for booking');
    }

    const existingPatientBooking = await this.prisma.booking.findFirst({
      where: {
        patientId: patientId,
        doctorId: dto.doctorId,
        date: dto.date,
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
    });

    if (existingPatientBooking) {
      throw new BadRequestException('You already have a booking with this doctor on this date');
    }

    const { duration, startTime } = dto;
    let endTime = timeConversion(startTime) + duration;

    const endHours = Math.floor(endTime / 60);
    const endMinutes = endTime % 60;
    const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes
      .toString()
      .padStart(2, '0')}`;

    if (!ALLOWED_DURATIONS.has(duration)) {
      throw new BadRequestException('Duration must be 60 or 120 minutes');
    }

    const existingAvailabilities = await this.prisma.availability.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
      },
    });

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

    const existingBookings = await this.prisma.booking.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
        status: {
          not: BookingStatus.CANCELLED,
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

    // return this.prisma.booking.create({
    //   data: {
    //     doctorId: dto.doctorId,
    //     patientId: patientId,
    //     date: dto.date,
    //     startTime: startTime,
    //     endTime: endTimeStr,
    //     duration: duration,
    //     status: BookingStatus.PENDING,
    //   },
    // });
	// ... existing validation code above ...

	// 1) First, create the booking and include some user info for messages
	const booking = await this.prisma.booking.create({
	data: {
		doctorId: dto.doctorId,
		patientId: patientId,
		date: dto.date,
		startTime: startTime,
		endTime: endTimeStr,
		duration: duration,
		status: BookingStatus.PENDING,
	},
	include: {
		patient: {
		select: {
			firstName: true,
			lastName: true,
		},
		},
		doctor: {
		select: {
			firstName: true,
			lastName: true,
		},
		},
	},
	});

	// 2) Create notification for the DOCTOR
	await this.notificationsService.createNotification(
	dto.doctorId,                        // userId: doctor receives it
	NotificationType.BOOKING_CREATED,    // type
	'New booking request',               // title
	`New booking from ${booking.patient.firstName} ${booking.patient.lastName} on ${booking.date} at ${booking.startTime}`, // message
	booking.id,                          // link to this booking
	);

	// 3) Create notification for the PATIENT
	await this.notificationsService.createNotification(
	patientId,                           // userId: patient receives it
	NotificationType.BOOKING_CREATED,    // type
	'Booking request sent',              // title
	`Your booking with Dr. ${booking.doctor.firstName} ${booking.doctor.lastName} on ${booking.date} at ${booking.startTime} has been created`, // message
	booking.id,                          // link to this booking
	);

	// 4) Finally, return the booking (so API still behaves as before)
	return booking;
  }

  async acceptBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can accept bookings');
    }

    if (booking.doctorId !== user.id) {
      throw new ForbiddenException('You are not authorized to accept this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not in a pending state');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
    });
  }

  async rejectBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can reject bookings');
    }

    if (booking.doctorId !== user.id) {
      throw new ForbiddenException('You are not authorized to reject this booking');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking is not in a pending state');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REJECTED },
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

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException('Only pending or accepted bookings can be cancelled');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  async getPatientBookings(patientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!user || user.role !== Role.PATIENT) {
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

  async getDoctorBookings(doctorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!user || user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can view their bookings');
    }

    return this.prisma.booking.findMany({
      where: { doctorId },
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
      orderBy: { date: 'desc' },
    });
  }

  async getDoctorSchedule(
    doctorId: string,
    user: { id: string; role: string },
    date?: string,
  ) {

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can view schedules');
    }


    if (doctorId !== user.id) {
      throw new ForbiddenException('You can only view your own schedule');
    }

    const where: any = {
      doctorId,
    };

    if (date) {
      where.date = date;
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

  async getPublicBookedSlots(doctorId: string, date?: string) {
    const where: any = {
      doctorId,
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
      },
    };

    if (date) {
      where.date = date;
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        duration: true,
        status: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return bookings;
  }
}