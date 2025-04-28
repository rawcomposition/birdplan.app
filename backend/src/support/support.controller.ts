import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailService } from '../common/email/email.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // Return 200 OK on success
  async sendSupportRequest(@Body() createSupportDto: CreateSupportRequestDto) {
    // No guard needed, this endpoint is public
    await this.emailService.sendSupportEmail(createSupportDto);
  }
}
