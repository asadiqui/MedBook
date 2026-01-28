import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsInt, ValidateIf } from 'class-validator';
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

  @ValidateIf((o) => o.gender !== undefined && o.gender !== null && o.gender !== '')
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ValidateIf((o) => o.dateOfBirth !== undefined && o.dateOfBirth !== null && o.dateOfBirth !== '')
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

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
