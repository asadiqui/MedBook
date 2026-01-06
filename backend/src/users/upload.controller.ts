import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

const avatarStorage = {
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new BadRequestException('Invalid file type. Allowed: jpeg, png, gif, webp'), false);
      return;
    }
    callback(null, true);
  },
};

const documentStorage = {
  storage: diskStorage({
    destination: './uploads/documents',
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new BadRequestException('Invalid file type. Allowed: pdf, jpeg, png'), false);
      return;
    }
    callback(null, true);
  },
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // POST /api/users/:id/avatar
  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarStorage))
  async uploadAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }
    return this.uploadService.uploadAvatar(id, file, userId, userRole);
  }

  // DELETE /api/users/:id/avatar
  @Delete(':id/avatar')
  async deleteAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.uploadService.deleteAvatar(id, userId, userRole);
  }

  // POST /api/users/:id/license-document
  @Post(':id/license-document')
  @UseInterceptors(FileInterceptor('document', documentStorage))
  async uploadLicenseDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }
    return this.uploadService.uploadLicenseDocument(id, file, userId, userRole);
  }

  // DELETE /api/users/:id/license-document
  @Delete(':id/license-document')
  async deleteLicenseDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.uploadService.deleteLicenseDocument(id, userId, userRole);
  }
}
