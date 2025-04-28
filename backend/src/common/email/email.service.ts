import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { RESET_TOKEN_EXPIRATION_HOURS } from '../constants/constants'; // Assuming constants file

// Interface for generic email sending options
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // Optional: defaults will be used if not provided
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly defaultFromEmail = 'BirdPlan.app <noreply@birdplan.app>'; // Default sender
  private readonly supportEmail = 'support@birdplan.app';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY is not configured in .env');
      throw new Error('Resend API key missing, EmailService cannot function.');
    }
    this.resend = new Resend(apiKey);
    // Verify support email is configured if needed, or default
    // this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL', 'support@birdplan.app');
  }

  // Generic send method
  private async send(options: SendEmailOptions): Promise<void> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      if (error) {
        this.logger.error(
          `Resend error sending email to ${options.to}: ${error.message}`,
          error,
        );
        throw new InternalServerErrorException(
          'Failed to send email via provider.',
        );
      }

      this.logger.log(
        `Email sent successfully to ${options.to}, Resend ID: ${data?.id}`,
      );
    } catch (error) {
      // Catch errors not already handled by Resend client
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error(
        `Error preparing or sending email to ${options.to}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // Specific method for Support emails
  async sendSupportEmail(data: {
    name: string;
    email: string;
    type: string;
    message: string;
    browserInfo?: { [key: string]: any };
  }): Promise<void> {
    const html = `
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Type:</strong> ${data.type}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br />')}</p>
        ${
          data.browserInfo
            ? `
        <hr />
        <p><strong>User ID:</strong> ${data.browserInfo.userId || 'N/A'}</p>
        <p><strong>Browser:</strong> ${data.browserInfo.userAgent || 'N/A'}</p>
        <p><strong>Screen Size:</strong> ${data.browserInfo.screenWidth || 'N/A'}x${data.browserInfo.screenHeight || 'N/A'}</p>
        `
            : ''
        }
      `;
    await this.send({
      to: this.supportEmail,
      subject: `BirdPlan.app Message from ${data.name} (${data.type})`,
      html,
      replyTo: data.email,
    });
  }

  // Specific method for Invite emails
  async sendInviteEmail(data: {
    tripName: string;
    fromName: string;
    email: string;
    url: string;
  }): Promise<void> {
    const html = `Hello,<br /><br />${data.fromName} invited to join their trip called '${data.tripName}'.<br /><br /><a href=${data.url}>Accept Invite</a>`;
    await this.send({
      to: data.email,
      subject: `${data.fromName} has invited you to join ${data.tripName}`,
      html,
      replyTo: data.email, // Or maybe the sender's email if available?
    });
  }

  // Specific method for Password Reset emails
  async sendPasswordResetEmail(data: {
    email: string;
    url: string;
  }): Promise<void> {
    const html = `Hello,<br /><br />Click the link below to reset your BirdPlan.app password.<br /><br /><a href="${data.url}">Reset Password</a><br /><br />This link will expire in ${RESET_TOKEN_EXPIRATION_HOURS} hours. If you did not request a password reset, please ignore this email.`;
    await this.send({
      to: data.email,
      subject: 'Reset your BirdPlan.app password',
      html,
    });
  }
}
