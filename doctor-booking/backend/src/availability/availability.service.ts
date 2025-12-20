import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvailabilityDto) {
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
