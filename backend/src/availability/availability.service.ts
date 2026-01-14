import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { overlapcheck, timeConversion } from '../common/utils/time';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto) {
    let first = timeConversion(dto.startTime);
    let second = timeConversion(dto.endTime);
    let CheckDate = new Date(dto.date);
    const today = new Date();

    // Prevent creating availability for past dates
    if (CheckDate < new Date(today.toDateString())) {
      throw new BadRequestException('Cannot create availability for past dates');
    }

    const maxfuture = new Date();
    maxfuture.setDate(maxfuture.getDate() + 30);

    if (CheckDate > maxfuture) {
      throw new BadRequestException('Date is too far in the future');
    }

    if (first >= second) {
      throw new BadRequestException('Start time must be before end time');
    }

    // time starting from 08:00 to 20:00
    if (first < timeConversion('08:00') || second > timeConversion('20:00')) {
      throw new BadRequestException('Availability must be between 08:00 and 20:00');
    }

    // Prevent creating an availability that conflicts with existing availability
    const existingAvailabilities = await this.prisma.availability.findMany({
      where: {
        doctorId: dto.doctorId,
        date: dto.date,
      },
    });

    for (const availability of existingAvailabilities) {
      if (
        overlapcheck(
          dto.startTime,
          dto.endTime,
          availability.startTime,
          availability.endTime,
        )
      ) {
        throw new BadRequestException(
          'Availability conflicts with existing availability',
        );
      }
    }

    return this.prisma.availability.create({
      data: {
        doctorId: dto.doctorId,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async findAll(doctorId?: string, date?: string) {
    return this.prisma.availability.findMany({
      where: {
        ...(doctorId && { doctorId }),
        ...(date && { date }),
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.availability.delete({
      where: { id },
    });
  }

  async getCalendar(
    doctorId: string,
    from: string,
    to: string,
  ) {

    if (!doctorId || !from || !to) {
      throw new BadRequestException('doctorId, from and to are required');
    }

    if (from > to) {
      throw new BadRequestException('"from" date must be before "to" date');
    }


    const availabilities = await this.prisma.availability.findMany({
      where: {
        doctorId,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
    
    const calendar: Record<string, any[]> = {};

    for (const slot of availabilities) {
      if (!calendar[slot.date]) {
        calendar[slot.date] = [];
      }

      calendar[slot.date].push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    }

    return calendar;
  }
}