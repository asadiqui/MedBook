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
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, Enable2FADto, Verify2FADto, VerifyEmailDto } from './dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import { documentStorage } from '../common/upload.config';
import { parseExpiryToMs } from '../common/utils/expiry';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(maxAgeMs?: number) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m');
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');

    res.cookie('accessToken', accessToken, this.getCookieOptions(parseExpiryToMs(accessExpiry)));
    res.cookie('refreshToken', refreshToken, this.getCookieOptions(parseExpiryToMs(refreshExpiry)));
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', this.getCookieOptions());
    res.clearCookie('refreshToken', this.getCookieOptions());
  }

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
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    if (result.tokens) {
      this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    }
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = refreshToken || req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    this.clearAuthCookies(res);
    return this.authService.logout(userId, token);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Body('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = refreshToken || req.cookies?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const tokens = await this.authService.refreshTokens(token);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return tokens;
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
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);

      if (result.message === 'Two-factor authentication required') {
        // Store temporary OAuth session
        const tempToken = Buffer.from(JSON.stringify(req.user)).toString('base64');
        const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://localhost:8443');
        return res.redirect(`${frontendUrl}/auth/2fa-verify?temp=${tempToken}`);
      }

      if (result.tokens) {
        this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://localhost:8443');
      const redirectUrl = `${frontendUrl}/auth/callback?success=1`;

      return res.redirect(redirectUrl);
    } catch (error) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://localhost:8443');
      const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
      return res.redirect(`${frontendUrl}/auth/login?error=${errorMessage}`);
    }
  }

  @Public()
  @Post('google/verify-2fa')
  @HttpCode(HttpStatus.OK)
  async googleVerify2FA(
    @Body() body: { tempToken: string; twoFactorCode: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const googleUser = JSON.parse(Buffer.from(body.tempToken, 'base64').toString());
      const result = await this.authService.googleLogin(googleUser, body.twoFactorCode);
      
      if (result.tokens) {
        this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
      }
      
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid 2FA code');
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
