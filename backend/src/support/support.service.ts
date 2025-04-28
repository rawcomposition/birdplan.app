import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly resend: Resend;
  private readonly supportEmail: string = 'support@birdplan.app'; // Could move to config

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not configured in .env');
      // Decide if this should block startup or just log an error
      throw new Error(
        'Resend API key is missing, Support module cannot function.',
      );
    }
    this.resend = new Resend(apiKey);
  }

  async sendSupportEmail(
    supportDto: CreateSupportRequestDto,
  ): Promise<{ success: boolean }> {
    const { name, email, type, message, browserInfo } = supportDto;
    this.logger.log(
      `Received support request from ${name} (${email}), type: ${type}`,
    );

    // Basic spam detection
    if (message.toUpperCase().includes('SEO')) {
      this.logger.warn(
        `Potential spam detected from ${email}, silently ignoring.`,
      );
      return { success: true }; // Mimic original behavior
    }

    const html = `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
      ${
        browserInfo
          ? `
      <hr />
      <p><strong>User ID:</strong> ${browserInfo.userId || 'N/A'}</p>
      <p><strong>Browser:</strong> ${browserInfo.userAgent || 'N/A'}</p>
      <p><strong>Screen Size:</strong> ${browserInfo.screenWidth || 'N/A'}x${browserInfo.screenHeight || 'N/A'}</p>
      `
          : ''
      }
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'BirdPlan Support <support@noreply.birdplan.app>', // Replace with your verified Resend domain/email
        to: [this.supportEmail],
        subject: `BirdPlan.app Message from ${name} (${type})`, // Include type in subject
        html: html,
        replyTo: email,
      });

      if (error) {
        this.logger.error(
          `Resend error sending support email from ${email}: ${error.message}`,
          error,
        );
        throw new InternalServerErrorException(
          'Failed to send support message via email provider.',
        );
      }

      this.logger.log(
        `Support email sent successfully to ${this.supportEmail}, Resend ID: ${data?.id}`,
      );
      return { success: true };
    } catch (error) {
      // Catch errors not already caught by Resend client error handling
      this.logger.error(
        `Error sending support email from ${email}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send message');
    }
  }
}
