import { IsString, IsNotEmpty } from 'class-validator';
export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Two-factor code is required' })
  code: string;
}

export { TwoFactorCodeDto as Enable2FADto };
export { TwoFactorCodeDto as Verify2FADto };