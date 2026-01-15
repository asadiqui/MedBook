import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EmailModule } from '../common/email.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    EmailModule,
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [UsersController, UploadController],
  providers: [UsersService, UploadService],
  exports: [UsersService],
})
export class UsersModule {}