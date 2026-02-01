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
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { avatarStorage, documentStorage } from '../common/upload.config';

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
