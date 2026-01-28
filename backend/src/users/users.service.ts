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

  async update(id: string, userId: string, userRole: Role, dto: UpdateUserDto) {
    if (id !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

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

  async adminUpdate(id: string, dto: AdminUpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deactivating admin accounts
    if (user.role === Role.ADMIN && dto.isActive === false) {
      throw new ForbiddenException('Cannot deactivate admin accounts');
    }

    const wasInactive = !user.isActive;
    const isNowActive = dto.isActive === true;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...dto,
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

  async remove(id: string, requestingUserId: string, requestingUserRole: Role) {
    if (id !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete with anonymization for privacy
    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        // Anonymize personal information
        email: `deleted_${id}_${Date.now()}@deleted.Sa7ti.com`,
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        avatar: null,
        bio: null,
      },
    });

    // Delete sensitive auth data immediately
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      }),
      this.prisma.passwordReset.deleteMany({
        where: { userId: id },
      }),
    ]);

    return { message: 'Account deactivated successfully. Personal information has been anonymized.' };
  }

  async getStats() {
    const [totalUsers, totalDoctors, totalPatients, totalAdmins, activeUsers, verifiedDoctors, pendingDoctors, newUsersThisMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.DOCTOR } }),
      this.prisma.user.count({ where: { role: Role.PATIENT } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: Role.DOCTOR, isVerified: true } }),
      this.prisma.user.count({ where: { role: Role.DOCTOR, isVerified: false } }),
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
      verifiedDoctors,
      pendingDoctors,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
    };
  }

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

    try {
      await this.authService.sendDoctorApprovalEmail(updatedUser.id);
    } catch (error) {
      console.error('Failed to send approval emails:', error);
    }

    return updatedUser;
  }

  async adminDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for dependencies before permanent deletion
    const bookingsCount = await this.prisma.booking.count({
      where: {
        OR: [
          { patientId: id },
          { doctorId: id },
        ],
      },
    });

    if (bookingsCount > 0) {
      throw new ConflictException(
        `Cannot permanently delete user with ${bookingsCount} booking(s). Use account deactivation instead to preserve data integrity.`,
      );
    }

    // Permanent deletion (only if no bookings exist)
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { userId: id },
      }),
      this.prisma.passwordReset.deleteMany({
        where: { userId: id },
      }),
      this.prisma.availability.deleteMany({
        where: { doctorId: id },
      }),
      this.prisma.user.delete({
        where: { id },
      }),
    ]);

    return { message: 'User permanently deleted from database' };
  }

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
