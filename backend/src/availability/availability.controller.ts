import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('availability')
@UseGuards(RolesGuard)
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  @Roles(Role.DOCTOR)
  create(@Body() dto: CreateAvailabilityDto, @CurrentUser('id') doctorId: string) {
    return this.availabilityService.create(dto, doctorId);
  }

  @Get('me')
  @Roles(Role.DOCTOR)
  findMine(
    @CurrentUser('id') doctorId: string,
    @Query('date') date?: string,
  ) {
    return this.availabilityService.findMine(doctorId, date);
  }

  @Get()
  @Public()
  findAll(
    @Query('doctorId') doctorId?: string,
    @Query('date') date?: string,
  ) {
    if (!doctorId) {
      throw new BadRequestException('doctorId query param is required');
    }

    return this.availabilityService.findAll(doctorId, date);
  }

  @Delete(':id')
  @Roles(Role.DOCTOR)
  remove(@Param('id') id: string, @CurrentUser('id') doctorId: string) {
    return this.availabilityService.remove(id, doctorId);
  }

  @Get('calendar')
  @Public()
  getCalendar(
    @Query('doctorId') doctorId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.availabilityService.getCalendar(doctorId, from, to);
  }
}