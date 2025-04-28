import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsNumber,
} from 'class-validator';

class BrowserInfoDto {
  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsNumber()
  @IsOptional()
  screenWidth?: number;

  @IsNumber()
  @IsOptional()
  screenHeight?: number;

  @IsString()
  @IsOptional() // User might not be logged in when sending support request
  userId?: string;
}

export class CreateSupportRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString() // Basic email format check could be added (@IsEmail)
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  type: string; // e.g., 'bug', 'feedback', 'question'

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrowserInfoDto)
  browserInfo?: BrowserInfoDto;
}
