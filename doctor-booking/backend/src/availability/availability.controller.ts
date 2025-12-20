import { Controller, Post, Body, Get, Query, Delete, Param } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';



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
    findAll(
      @Query('doctorId') doctorId?: string,
      @Query('date') date?: string,
    ) {
      return this.availabilityService.findAll(
        doctorId ? Number(doctorId) : undefined,
        date,
      );
    }
    
    @Delete(':id')
    remove(@Param('id') id: string) {
  return this.availabilityService.remove(Number(id));
    }


}