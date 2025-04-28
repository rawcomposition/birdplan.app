import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// DTOs will be imported here later

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoints will be added here

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    // In a real app, avoid confirming if the email exists to prevent enumeration attacks
    // Just always return OK status.
    await this.authService.handleForgotPassword(forgotPasswordDto.email);
  }

  @Get('verify-reset-token')
  @HttpCode(HttpStatus.OK)
  async verifyResetToken(
    @Query('token') token: string,
  ): Promise<{ valid: boolean }> {
    const isValid = await this.authService.verifyResetToken(token);
    return { valid: isValid };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
    // Consider invalidating the token after successful reset
  }
}
