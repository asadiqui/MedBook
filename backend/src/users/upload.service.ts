import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
    requestingUserId: string,
    requestingUserRole: Role,
  ) {
    if (userId !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own avatar');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar) {
      await this.deleteFile(user.avatar);
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        avatar: true,
      },
    });

    return {
      message: 'Avatar uploaded successfully',
      avatar: updatedUser.avatar,
    };
  }

  async uploadLicenseDocument(
    userId: string,
    file: Express.Multer.File,
    requestingUserId: string,
    requestingUserRole: Role,
  ) {
    if (userId !== requestingUserId && requestingUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only upload your own documents');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can upload license documents');
    }

    if (user.licenseDocument) {
      await this.deleteFile(user.licenseDocument);
    }

    const documentUrl = `/uploads/documents/${file.filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { licenseDocument: documentUrl },
      select: {
        id: true,
        licenseDocument: true,
      },
    });

    return {
      message: 'License document uploaded successfully',
      licenseDocument: updatedUser.licenseDocument,
    };
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}
