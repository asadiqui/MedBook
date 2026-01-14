import { IsString, Matches, IsInt } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  doctorId: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string; // HH:mm

  @IsInt()
  duration: number; // in minutes, 60 or 120
}