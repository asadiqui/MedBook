import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto, AdminUpdateUserDto, QueryUsersDto } from './dto';
import { Role } from '@prisma/client';
import { EmailService } from '../common/email.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private authService: AuthService,
  ) {}

  // GET ALL USERS (Admin only)
  async findAll(query: QueryUsersDto) {
    const { search, role, specialty, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    const total = await this.prisma.user.count({ where });

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
        specialty: true,
        licenseNumber: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
        clinicContactPerson: true,
        clinicPhone: true,
        licenseDocument: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET ALL DOCTORS (Public)
  async findAllDoctors(query: QueryUsersDto) {
    const { search, specialty, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
      role: Role.DOCTOR,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    const total = await this.prisma.user.count({ where });

    const doctors = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        specialty: true,
        bio: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: doctors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET USER BY ID
  async findOne(id: string, requestingUserId: string, requestingUserRole: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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
        specialty: true,
        licenseNumber: true,
        bio: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
        clinicContactPerson: true,
        clinicPhone: true,
        licenseDocument: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (requestingUserRole !== Role.ADMIN && requestingUserId !== id) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        specialty: user.specialty,
        bio: user.bio,
        consultationFee: user.consultationFee,
      };
    }

    return user;
  }

  // GET DOCTOR PROFILE (Public)
  async findDoctorProfile(id: string) {
    const doctor = await this.prisma.user.findFirst({
      where: {
        id,
        role: Role.DOCTOR,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        specialty: true,
        bio: true,
        consultationFee: true,
        affiliation: true,
        yearsOfExperience: true,
        clinicAddress: true,
        clinicContactPerson: true,
        clinicPhone: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  // UPDATE USER
  async update(id: string, userId: string, userRole: Role, dto: UpdateUserDto) {
    if (id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only doctors can update doctor-specific fields
    if (user.role !== Role.DOCTOR) {
      delete dto.specialty;
      delete dto.licenseNumber;
      delete dto.consultationFee;
      delete dto.affiliation;
      delete dto.yearsOfExperience;
      delete dto.clinicAddress;
      delete dto.clinicContactPerson;
      delete dto.clinicPhone;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
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
        specialty: true,
        licenseNumber: true,
        bio: true,
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
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // ADMIN UPDATE USER
  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const wasInactive = !user.isActive;
    const isNowActive = dto.isActive === true;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
        email: dto.email?.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
        updatedAt: true,
      },
    });

    // Send approval email to doctor if they were inactive and are now active
    if (wasInactive && isNowActive && user.role === Role.DOCTOR) {
      try {
        const doctorName = `${user.firstName} ${user.lastName}`;
        await this.emailService.sendDoctorApprovalEmail(user.email, doctorName);
      } catch (error) {
        console.error('Failed to send doctor approval email:', error);
      }
    }

    return updatedUser;
  }

  // DELETE USER
  async remove(id: string, requestingUserId: string, requestingUserRole: Role) {
    if (id !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.refreshToken.deleteMany({
      where: { userId: id },
    });

    return { message: 'User deleted successfully' };
  }

  // GET USER STATS (Admin)
  async getStats() {
    const [totalUsers, totalDoctors, totalPatients, totalAdmins, activeUsers, newUsersThisMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.DOCTOR } }),
      this.prisma.user.count({ where: { role: Role.PATIENT } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalDoctors,
      totalPatients,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersThisMonth,
    };
  }

  // APPROVE DOCTOR (Admin only)
  async approveDoctor(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('User is not a doctor');
    }

    if (user.isVerified) {
      throw new ConflictException('Doctor is already verified');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isVerified: true, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        specialty: true,
        licenseNumber: true,
      },
    });

    // Send verification email and approval email to the doctor
    try {
      await this.authService.sendEmailVerification(updatedUser.id, true);
      await this.authService.sendDoctorApprovalEmail(updatedUser.id);
    } catch (error) {
      console.error('Failed to send approval emails:', error);
      // Don't fail the approval if emails fail
    }

    return updatedUser;
  }

  // DELETE USER (Admin only)
  async adminDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        refreshTokens: true,
        passwordResets: true,
        availabilities: true,
        bookingsAsDoctor: true,
        bookingsAsPatient: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete all related data in transaction
    await this.prisma.$transaction([
      // Delete refresh tokens
      this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      }),
      // Delete password resets
      this.prisma.passwordReset.deleteMany({
        where: { userId: id },
      }),
      // Delete availabilities
      this.prisma.availability.deleteMany({
        where: { doctorId: id },
      }),
      // Delete bookings as doctor
      this.prisma.booking.deleteMany({
        where: { doctorId: id },
      }),
      // Delete bookings as patient
      this.prisma.booking.deleteMany({
        where: { patientId: id },
      }),
      // Finally delete the user
      this.prisma.user.delete({
        where: { id },
      }),
    ]);

    return { message: 'User deleted successfully' };
  }

  // GET DOCTOR DOCUMENT (Admin only)
  async getDoctorDocument(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        licenseDocument: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('User is not a doctor');
    }

    return {
      doctor: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      documentPath: user.licenseDocument,
    };
  }
}
