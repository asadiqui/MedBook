import { IsString, IsNotEmpty } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty({ message: 'Two-factor code is required' })
  code: string;
}