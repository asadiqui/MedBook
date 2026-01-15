import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsDateString, IsNumber } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEnum(Role, { message: 'Role must be either PATIENT or DOCTOR' })
  @IsOptional()
  role?: Role = Role.PATIENT;

  @IsString()
  @IsOptional()
  phone?: string;

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
  affiliation?: string;

  @IsNumber()
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

  @IsNumber()
  @IsOptional()
  consultationFee?: number;
  licenseDocument?: Express.Multer.File;
}
