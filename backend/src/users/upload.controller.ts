import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

// Ensure upload directories exist - use process.cwd() for Docker compatibility
const uploadsDir = join(process.cwd(), 'uploads');
const avatarsDir = join(uploadsDir, 'avatars');
const documentsDir = join(uploadsDir, 'documents');

if (!existsSync(avatarsDir)) {
  mkdirSync(avatarsDir, { recursive: true });
}
if (!existsSync(documentsDir)) {
  mkdirSync(documentsDir, { recursive: true });
}

const avatarStorage = {
  storage: diskStorage({
    destination: avatarsDir,
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
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
    destination: documentsDir,
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
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
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
}
