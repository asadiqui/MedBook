import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsDateString, IsNumber, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Type } from 'class-transformer';
import { Role, Gender } from '@prisma/client';

@ValidatorConstraint({ name: 'IsNotFutureDate', async: false })
export class IsNotFutureDate implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    if (!dateString) return true;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Date of birth cannot be in the future';
  }
}

@ValidatorConstraint({ name: 'IsAtLeast18', async: false })
export class IsAtLeast18 implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments) {
    if (!dateString) return true;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }

  defaultMessage(args: ValidationArguments) {
    return 'You must be at least 18 years old to register';
  }
}

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
  @Validate(IsNotFutureDate)
  @Validate(IsAtLeast18)
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(Gender, { message: 'Gender must be MALE, FEMALE, or OTHER' })
  @IsOptional()
  gender?: Gender;

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
  @Type(() => Number)
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
  @Type(() => Number)
  consultationFee?: number;
  licenseDocument?: Express.Multer.File;
}
