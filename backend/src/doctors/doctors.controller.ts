import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  // GET /api/doctors
  @Public()
  @Get()
  listDoctors() {
    return this.doctorsService.listDoctors();
  }
}
