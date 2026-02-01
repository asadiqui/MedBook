import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Shared DTO for two-factor authentication code validation.
 * Used for both enabling and verifying 2FA.
 */
export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Two-factor code is required' })
  code: string;
}

// Alias for backward compatibility
export { TwoFactorCodeDto as Enable2FADto };
export { TwoFactorCodeDto as Verify2FADto };