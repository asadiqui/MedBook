import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, Enable2FADto, Verify2FADto, VerifyEmailDto } from './dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

const documentStorage = {
  storage: diskStorage({
    destination: './uploads/documents',
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
      callback(new Error('Invalid file type. Allowed: pdf, jpeg, png'), false);
      return;
    }
    callback(null, true);
  },
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @UseInterceptors(FileInterceptor('licenseDocument', documentStorage))
  async register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.licenseDocument = file;
    }
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.logout(userId, refreshToken);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('me')
  async getCurrentUser(@CurrentUser('id') userId: string) {
    return this.authService.getCurrentUser(userId);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport GoogleAuthGuard handles the redirect
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}`;
      
      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
    }
  }

  @Post('2fa/enable')
  async enable2FA(@CurrentUser('id') userId: string) {
    return this.authService.enable2FA(userId);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verifyAndEnable2FA(@CurrentUser('id') userId: string, @Body() dto: Enable2FADto) {
    return this.authService.verifyAndEnable2FA(userId, dto);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disable2FA(@CurrentUser('id') userId: string, @Body() dto: Verify2FADto) {
    return this.authService.disable2FA(userId, dto);
  }

  @Post('email/send-verification')
  @HttpCode(HttpStatus.OK)
  async sendEmailVerification(@CurrentUser('id') userId: string) {
    return this.authService.sendEmailVerification(userId);
  }

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }
}
