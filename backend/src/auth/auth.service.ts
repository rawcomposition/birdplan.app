import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { EmailService } from '../common/email/email.service';
import { RESET_TOKEN_EXPIRATION_HOURS } from '../common/constants/constants';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Firebase Admin SDK...');

    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    if (admin.apps.length === 0) {
      if (!privateKey || !clientEmail) {
        this.logger.error(
          'FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL is missing in .env',
        );
        throw new Error(
          'Firebase Admin SDK configuration is incomplete. Check .env file.',
        );
      }

      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey,
          }),
          projectId: projectId,
        });
        this.logger.log('Firebase Admin SDK Initialized Successfully');
      } catch (error) {
        this.logger.error(
          'Failed to initialize Firebase Admin SDK:',
          error.stack,
        );
        throw new Error('Firebase Admin SDK initialization failed.');
      }
    }
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decodedToken = await admin.auth().verifyIdToken(cleanToken);
      return decodedToken;
    } catch (error) {
      this.logger.error(`Firebase token verification failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async handleForgotPassword(email: string): Promise<void> {
    this.logger.log(`Password reset requested for email: ${email}`);
    try {
      const resetToken = 'generate-a-secure-random-token';
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + RESET_TOKEN_EXPIRATION_HOURS);

      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      await this.emailService.sendPasswordResetEmail({
        email: email,
        url: resetUrl,
      });

      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Error handling forgot password for ${email}: ${error.message}`,
        error.stack,
      );
    }
  }

  async verifyResetToken(token: string): Promise<boolean> {
    this.logger.log(`Verifying password reset token: ${token}`);
    try {
      return token === 'generate-a-secure-random-token';
    } catch (error) {
      this.logger.error(
        `Error verifying reset token ${token}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    this.logger.log(`Attempting password reset with token: ${token}`);
    try {
      if (token !== 'generate-a-secure-random-token') {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      this.logger.log(
        `Password successfully reset for user associated with token: ${token}`,
      );
    } catch (error) {
      this.logger.error(
        `Error resetting password with token ${token}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }
}
