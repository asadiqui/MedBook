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
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto, Enable2FADto, Verify2FADto, VerifyEmailDto } from './dto';
import { Role } from '@prisma/client';
import { EmailService } from '../common/email.service';

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
    isOAuth: boolean;
  };
  tokens: TokenPayload | null;
  message?: string;
}

export interface Enable2FAResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface EmailVerificationResponse {
  message: string;
}

const USER_SELECT = {
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
  googleId: true,
} as const;

const LOGIN_USER_SELECT = {
  ...USER_SELECT,
  password: true,
  isTwoFactorEnabled: true,
  twoFactorSecret: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate doctor-specific fields
    if (dto.role === Role.DOCTOR) {
      this.validateDoctorFields(dto);
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || Role.PATIENT,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        isActive: dto.role === Role.DOCTOR ? false : true, // Doctors need admin approval
        licenseDocument: dto.licenseDocument ? `/uploads/documents/${dto.licenseDocument.filename}` : null,
        ...this.getDoctorData(dto),
      },
      select: USER_SELECT,
    });

    // Send email verification only for non-doctors
    if (dto.role !== Role.DOCTOR) {
      try {
        await this.sendEmailVerification(user.id);
      } catch (error) {
        // Log error but don't fail registration
        console.error('Failed to send verification email:', error);
      }
    }

    // For doctors, send additional email about approval process
    if (dto.role === Role.DOCTOR) {
      try {
        await this.sendDoctorRegistrationEmail(user.id);
      } catch (error) {
        console.error('Failed to send doctor registration email:', error);
      }
    }

    return {
      user: {
        ...user,
        isOAuth: false,
      },
      tokens: null, // No tokens until email verification
      message: dto.role === Role.DOCTOR 
        ? 'Registration successful! Please verify your email and wait for admin approval.'
        : 'Registration successful! Please verify your email to complete your account setup.',
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: LOGIN_USER_SELECT,
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

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in');
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

    const { password, twoFactorSecret, googleId, ...userWithoutSensitive } = user;

    return {
      user: {
        ...userWithoutSensitive,
        isOAuth: !!googleId,
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

    // Generate new tokens and delete old refresh token in transaction
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    return tokens;
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

    // Check if user is OAuth user
    if (user.googleId) {
      return { message: 'This account uses Google login. Please sign in with Google.' };
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

  async enable2FA(userId: string): Promise<Enable2FAResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const secret = authenticator.generateSecret();
    const appName = this.configService.get<string>('APP_NAME', 'MedBook');
    const otpauth = authenticator.keyuri(user.email, appName, secret);

    const qrCodeUrl = await toDataURL(otpauth);

    // Store the secret temporarily (not yet enabled)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      qrCodeUrl,
    };
  }

  async verifyAndEnable2FA(userId: string, dto: Enable2FADto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication setup not initiated');
    }

    if (user.isTwoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async disable2FA(userId: string, dto: Verify2FADto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }

    const isValid = authenticator.verify({
      token: dto.code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid two-factor code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async sendEmailVerification(userId: string, isDoctorApproval: boolean = false): Promise<EmailVerificationResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Delete any existing verification tokens for this user
    await this.prisma.passwordReset.deleteMany({
      where: { userId },
    });

    // Create new verification token (reuse password reset table for simplicity)
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.passwordReset.create({
      data: {
        token: verificationToken,
        userId,
        expiresAt,
      },
    });

    // Send email with verification link
    await this.emailService.sendVerificationEmail(user.email, verificationToken, isDoctorApproval);

    return { message: 'Verification email sent' };
  }

  async sendDoctorRegistrationEmail(userId: string): Promise<EmailVerificationResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Send email to doctor about registration and approval process
    const doctorName = `${user.firstName} ${user.lastName}`;
    await this.emailService.sendDoctorVerificationEmail(user.email, doctorName);

    return { message: 'Doctor registration email sent' };
  }

  async sendDoctorApprovalEmail(userId: string): Promise<EmailVerificationResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Send email to doctor with login link
    const doctorName = `${user.firstName} ${user.lastName}`;
    await this.emailService.sendDoctorApprovalEmail(user.email, doctorName);

    return { message: 'Doctor approval email sent' };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<EmailVerificationResponse> {
    const verification = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!verification || verification.used || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Update user and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { isEmailVerified: true },
      }),
      this.prisma.passwordReset.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Email verified successfully' };
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
        googleId: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      isOAuth: !!user.googleId,
    };
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
      select: USER_SELECT,
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
            avatar: googleUser.avatar || existingUser.avatar,
            isEmailVerified: true,
          },
          select: USER_SELECT,
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
          select: USER_SELECT,
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
        ...user,
        isOAuth: true,
      },
      tokens,
    };
  }

  private validateDoctorFields(dto: RegisterDto): void {
    if (!dto.specialty) {
      throw new BadRequestException('Specialty is required for doctors');
    }
    if (!dto.licenseNumber) {
      throw new BadRequestException('License number is required for doctors');
    }
  }

  private getDoctorData(dto: RegisterDto) {
    if (dto.role !== Role.DOCTOR) return {};
    return {
      specialty: dto.specialty,
      licenseNumber: dto.licenseNumber,
      affiliation: dto.affiliation,
      yearsOfExperience: dto.yearsOfExperience,
      clinicAddress: dto.clinicAddress,
      clinicContactPerson: dto.clinicContactPerson,
      clinicPhone: dto.clinicPhone,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
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
    return authenticator.verify({
      token: code,
      secret,
    });
  }
}
