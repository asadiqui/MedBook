import { IsOptional, IsString, Matches, IsDateString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsString()
  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  endTime: string;
}