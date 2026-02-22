import { IsString, Matches, IsInt, IsUUID, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string;

  //ex starttime 

  @IsInt()
  @IsIn([60, 120])
  @Type(() => Number)
  duration: number;
}