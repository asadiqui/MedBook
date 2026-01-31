import { IsInt, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  doctorId: string;

  @IsString()
  date: string; // YYYY-MM-DD

  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  startTime: string; // HH:mm

  // New contract: caller can provide endTime.
  // Backward-compatible: caller can still provide duration (minutes).
  @ValidateIf((o) => o.endTime == null)
  @IsInt()
  @IsOptional()
  duration?: number; // in minutes (legacy)

  @ValidateIf((o) => o.duration == null)
  @IsString()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  @IsOptional()
  endTime?: string; // HH:mm

  // New contract includes patientId; backend may still use the authenticated user.
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}