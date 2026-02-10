import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { timeConversion } from "../common/utils/time";
import { BookingStatus, Role } from "@prisma/client";
import { NotificationsService } from "../notifications/notifications.service";
import { ChatGateway } from "../chat/chat.gateway";

const ALLOWED_DURATIONS = new Set([60, 120]);

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  async createBooking(dto: CreateBookingDto, patientId: string) {
    const checkDate = new Date(dto.date);
    const today = new Date();

    if (checkDate < new Date(today.toDateString())) {
      throw new BadRequestException("Cannot create availability for past dates");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true, firstName: true, lastName: true },
    });

    if (!user || user.role !== Role.PATIENT) {
      throw new ForbiddenException("Only patients can create bookings");
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: dto.doctorId },
      select: { id: true, role: true, isActive: true, isVerified: true },
    });

    if (
      !doctor ||
      doctor.role !== Role.DOCTOR ||
      !doctor.isActive ||
      !doctor.isVerified
    ) {
      throw new BadRequestException("Selected doctor is not available for booking");
    }

    const existingPatientBooking = await this.prisma.booking.findFirst({
      where: {
        patientId,
        doctorId: dto.doctorId,
        date: dto.date,
        status: {
          not: BookingStatus.CANCELLED,
        },
      },
    });

    if (existingPatientBooking) {
      throw new BadRequestException(
        "You already have a booking with this doctor on this date"
      );
    }

    const { duration, startTime } = dto;
    const endTime = timeConversion(startTime) + duration;

    const endHours = Math.floor(endTime / 60);
    const endMinutes = endTime % 60;
    const endTimeStr = `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;

    if (!ALLOWED_DURATIONS.has(duration)) {
      throw new BadRequestException("Duration must be 60 or 120 minutes");
    }

    const existingAvailabilities = await this.prisma.availability.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
      },
    });

    if (existingAvailabilities.length === 0) {
      throw new BadRequestException(
        "No availability found for this doctor on the selected date"
      );
    }

    const bookingStart = timeConversion(startTime);
    const bookingEnd = timeConversion(endTimeStr);

    const bookingFitsInAvailability = existingAvailabilities.some((availability) => {
      const availabilityStart = timeConversion(availability.startTime);
      const availabilityEnd = timeConversion(availability.endTime);

      return bookingStart >= availabilityStart && bookingEnd <= availabilityEnd;
    });

    if (!bookingFitsInAvailability) {
      throw new BadRequestException(
        "Booking time does not fit within doctor availability"
      );
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

      const overlaps = bookingStart < existingEnd && existingStart < bookingEnd;

      if (overlaps) {
        throw new BadRequestException("Time slot already booked");
      }
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        doctorId: dto.doctorId,
        patientId,
        date: dto.date,
        startTime,
        endTime: endTimeStr,
        duration,
        status: BookingStatus.PENDING,
      },
    });

    // Notify doctor (LIVE + DB)
    await this.notificationsService.createNotification({
      userId: booking.doctorId,
      type: "BOOKING_STATUS",
      title: "New Booking Request",
      body: `New request from ${user.firstName} ${user.lastName} on ${booking.date} at ${booking.startTime}`,
      data: {
        bookingId: booking.id,
        patientId: booking.patientId,
        doctorId: booking.doctorId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      },
    });

    return booking;
  }

  async acceptBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can accept bookings");
    }
    if (booking.doctorId !== user.id) {
      throw new ForbiddenException("You are not authorized to accept this booking");
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException("Booking is not in a pending state");
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
    });

    // Notify patient
    await this.notificationsService.createNotification({
      userId: updated.patientId,
      type: "BOOKING_STATUS",
      title: "Booking Accepted",
      body: `Your booking on ${updated.date} at ${updated.startTime} was accepted.`,
      data: {
        bookingId: updated.id,
        patientId: updated.patientId,
        doctorId: updated.doctorId,
        date: updated.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        status: updated.status,
      },
    });

    return updated;
  }

  async rejectBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can reject bookings");
    }
    if (booking.doctorId !== user.id) {
      throw new ForbiddenException("You are not authorized to reject this booking");
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException("Booking is not in a pending state");
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REJECTED },
    });

    // Notify patient
    await this.notificationsService.createNotification({
      userId: updated.patientId,
      type: "BOOKING_STATUS",
      title: "Booking Rejected",
      body: `Your booking on ${updated.date} at ${updated.startTime} was rejected.`,
      data: {
        bookingId: updated.id,
        patientId: updated.patientId,
        doctorId: updated.doctorId,
        date: updated.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        status: updated.status,
      },
    });

    // Notify both parties so their chat list and unread badge update in real-time
    this.chatGateway.emitBookingCancelled(updated.doctorId, updated.id);
    this.chatGateway.emitBookingCancelled(updated.patientId, updated.id);

    return updated;
  }

  async cancelBooking(bookingId: string, user: any) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    const isPatient = booking.patientId === user.id;
    const isDoctor = booking.doctorId === user.id;

    if (!isPatient && !isDoctor) {
      throw new ForbiddenException("You are not authorized to cancel this booking");
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.ACCEPTED
    ) {
      throw new BadRequestException(
        "Only pending or accepted bookings can be cancelled"
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    // Notify the other party
    const targetUserId = isPatient ? updated.doctorId : updated.patientId;
    const cancelledBy = isPatient ? "patient" : "doctor";

    await this.notificationsService.createNotification({
      userId: targetUserId,
      type: "BOOKING_STATUS",
      title: "Booking Cancelled",
      body: `Booking on ${updated.date} at ${updated.startTime} was cancelled by the ${cancelledBy}.`,
      data: {
        bookingId: updated.id,
        patientId: updated.patientId,
        doctorId: updated.doctorId,
        date: updated.date,
        startTime: updated.startTime,
        endTime: updated.endTime,
        status: updated.status,
        cancelledBy,
      },
    });

    // Notify both parties so their chat list and unread badge update in real-time
    this.chatGateway.emitBookingCancelled(updated.doctorId, updated.id);
    this.chatGateway.emitBookingCancelled(updated.patientId, updated.id);

    return updated;
  }

  async getPatientBookings(patientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!user || user.role !== Role.PATIENT) {
      throw new ForbiddenException("Only patients can view their bookings");
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
      orderBy: { date: "desc" },
    });
  }

  async getDoctorBookings(doctorId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!user || user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can view their bookings");
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
      orderBy: { date: "desc" },
    });
  }

  async getDoctorSchedule(
    doctorId: string,
    user: { id: string; role: string },
    date?: string
  ) {
    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can view schedules");
    }

    if (doctorId !== user.id) {
      throw new ForbiddenException("You can only view your own schedule");
    }

    const where: any = { doctorId };
    if (date) where.date = date;

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
      orderBy: [{ startTime: "asc" }],
    });
  }

  async getPublicBookedSlots(doctorId: string, date?: string) {
    const where: any = {
      doctorId,
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
      },
    };

    if (date) where.date = date;

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
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return bookings;
  }
}