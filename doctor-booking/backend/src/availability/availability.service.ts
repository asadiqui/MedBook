import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { overlapcheck, timeConversion } from 'src/common/utlis/time';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto) {
    
    let first = timeConversion(dto.startTime);
    let second = timeConversion(dto.endTime);

    if (first >= second) {
      throw new BadRequestException('Start time must be before end time');
    }

    // time startig from 08:00 to 20:00
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

  async findAll(doctorId?: number, date?: string) {
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

  async remove(id: number) {
    return this.prisma.availability.delete({
      where: { id },
    });
  }
}
