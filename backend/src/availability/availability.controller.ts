import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  create(@Body() dto: CreateAvailabilityDto) {
    return this.availabilityService.create(dto);
  }

  @Get()
  @Public()
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    return this.availabilityService.findAll(doctorId, date);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilityService.remove(id);
  }
  @Get('calendar')
  getCalendar(
    @Query('doctorId') doctorId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availabilityService.getCalendar(doctorId, from, to);
  }
}