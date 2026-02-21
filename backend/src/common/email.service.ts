import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  private async getGmailClient() {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GMAIL_CLIENT_ID'),
      this.configService.get<string>('GMAIL_CLIENT_SECRET'),
      'https://developers.google.com/oauthplayground',
    );
    oauth2Client.setCredentials({
      refresh_token: this.configService.get<string>('GMAIL_REFRESH_TOKEN'),
    });
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  private buildRawMessage(to: string, subject: string, html: string, from: string): string {
    const messageParts = [
      `From: "${this.configService.get<string>('APP_NAME')}" <${from}>`,
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      html,
    ];
    const message = messageParts.join('\n');
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        this.logger.error(`Invalid email address: ${to}`);
        return;
      }

      const from = this.configService.get<string>('EMAIL_USER');
      const gmail = await this.getGmailClient();
      const raw = this.buildRawMessage(to, subject, html, from);

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      });

      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error('Email sending failed', error as Error);
    }
  }

  async sendVerificationEmail(email: string, token: string, isDoctorApproval: boolean = false): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${isDoctorApproval ? '<h2 style="color: #10B981;">Registration successful! Please verify your email and wait for admin approval.</h2>' : '<h2>Welcome to MedBook!</h2>'}
        <p>Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, 'Verify Your MedBook Account', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your MedBook account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(email, 'Reset Your MedBook Password', html);
  }

  async sendDoctorVerificationEmail(email: string, doctorName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Doctor Application Submitted</h2>
        <p>Dear ${doctorName},</p>
        <p>Your doctor application has been submitted successfully and is pending review.</p>
        <p>Our admin team will review your application and uploaded documents within 24-48 hours.</p>
        <p>You will receive an email notification once your application is approved or if additional information is needed.</p>
        <p>Thank you for choosing MedBook!</p>
        <br>
        <p>Best regards,<br>The MedBook Team</p>
      </div>
    `;

    await this.sendEmail(email, 'Doctor Application Submitted - MedBook', html);
  }

  async sendDoctorApprovalEmail(email: string, doctorName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! Your Doctor Account is Approved</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>We're pleased to inform you that your doctor application has been approved!</p>
        <p>You can now:</p>
        <ul>
          <li>Set your availability and consultation fees</li>
          <li>Accept patient appointments</li>
          <li>Manage your profile and documents</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${this.configService.get<string>('FRONTEND_URL')}/auth/login"
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <p>Welcome to the MedBook medical community!</p>
        <br>
        <p>Best regards,<br>The MedBook Team</p>
      </div>
    `;

    await this.sendEmail(email, 'Doctor Account Approved - MedBook', html);
  }
}