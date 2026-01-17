import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateAvailabilityDto {
  // Backward compatibility: frontend may still send doctorId,
  // but the backend always uses the authenticated doctor's id.
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string; // HH:mm

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  endTime: string; // HH:mm
}