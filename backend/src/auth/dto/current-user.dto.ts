import { Role } from '@prisma/client';

export class BaseUserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: Date;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  redirectPath: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class DoctorUserResponseDto extends BaseUserResponseDto {
  specialty?: string;
  licenseNumber?: string;
  licenseDocument?: string;
  bio?: string;
  consultationFee?: number;
  affiliation?: string;
  yearsOfExperience?: number;
  clinicAddress?: string;
  clinicContactPerson?: string;
  clinicPhone?: string;
  isVerified: boolean;
}

export type CurrentUserResponseDto = BaseUserResponseDto | DoctorUserResponseDto;
