import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { Role } from '@prisma/client';

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    avatar: string | null;
    phone: string | null;
    gender: string | null;
    dateOfBirth: Date | null;
    bio: string | null;
    specialty: string | null;
    licenseNumber: string | null;
    consultationFee: number | null;
    affiliation: string | null;
    yearsOfExperience: number | null;
    clinicAddress: string | null;
    clinicContactPerson: string | null;
    clinicPhone: string | null;
    licenseDocument: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
  };
  tokens: TokenPayload;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate doctor-specific fields
    if (dto.role === Role.DOCTOR) {
      if (!dto.specialty) {
        throw new BadRequestException('Specialty is required for doctors');
      }
      if (!dto.licenseNumber) {
        throw new BadRequestException('License number is required for doctors');
      }
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || Role.PATIENT,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        // Doctor-specific fields
        specialty: dto.role === Role.DOCTOR ? dto.specialty : undefined,
        licenseNumber: dto.role === Role.DOCTOR ? dto.licenseNumber : undefined,
        affiliation: dto.role === Role.DOCTOR ? dto.affiliation : undefined,
        yearsOfExperience: dto.role === Role.DOCTOR ? dto.yearsOfExperience : undefined,
        clinicAddress: dto.role === Role.DOCTOR ? dto.clinicAddress : undefined,
        clinicContactPerson: dto.role === Role.DOCTOR ? dto.clinicContactPerson : undefined,
        clinicPhone: dto.role === Role.DOCTOR ? dto.clinicPhone : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        bio: true,
        specialty: true,
        licenseNumber: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
        clinicContactPerson: true,
        clinicPhone: true,
        licenseDocument: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    const isPasswordValid = await this.comparePasswords(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check 2FA if enabled
    if (user.isTwoFactorEnabled) {
      if (!dto.twoFactorCode) {
        throw new UnauthorizedException('Two-factor authentication code is required');
      }
      const isValid = await this.verify2FACode(user.twoFactorSecret!, dto.twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        consultationFee: user.consultationFee,
        affiliation: user.affiliation,
        yearsOfExperience: user.yearsOfExperience,
        clinicAddress: user.clinicAddress,
        clinicContactPerson: user.clinicContactPerson,
        clinicPhone: user.clinicPhone,
        licenseDocument: user.licenseDocument,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPayload> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Cannot change password for this account');
    }

    const isPasswordValid = await this.comparePasswords(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    // Delete any existing reset tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.passwordReset.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return { message: 'If an account exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset || passwordReset.used || passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: passwordReset.userId },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        gender: true,
        dateOfBirth: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
        specialty: true,
        licenseNumber: true,
        licenseDocument: true,
        bio: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
        clinicContactPerson: true,
        clinicPhone: true,
        isTwoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: googleUser.email.toLowerCase() },
      });

      if (existingUser) {
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.googleId,
            avatar: existingUser.avatar || googleUser.avatar,
            isEmailVerified: true,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            googleId: googleUser.googleId,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            avatar: googleUser.avatar,
            isEmailVerified: true,
            role: Role.PATIENT,
          },
        });
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        consultationFee: user.consultationFee,
        affiliation: user.affiliation,
        yearsOfExperience: user.yearsOfExperience,
        clinicAddress: user.clinicAddress,
        clinicContactPerson: user.clinicContactPerson,
        clinicPhone: user.clinicPhone,
        licenseDocument: user.licenseDocument,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private async generateTokens(userId: string, email: string, role: Role): Promise<TokenPayload> {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m'),
    });

    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async verify2FACode(secret: string, code: string): Promise<boolean> {
    // Will be implemented with otplib in 2FA module
    return true;
  }
}
