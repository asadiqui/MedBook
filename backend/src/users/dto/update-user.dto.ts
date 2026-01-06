import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsInt } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  // Doctor-specific fields
  @IsString()
  @IsOptional()
  specialty?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsNumber()
  @IsOptional()
  consultationFee?: number;

  @IsString()
  @IsOptional()
  affiliation?: string;

  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  clinicAddress?: string;

  @IsString()
  @IsOptional()
  clinicContactPerson?: string;

  @IsString()
  @IsOptional()
  clinicPhone?: string;
}
