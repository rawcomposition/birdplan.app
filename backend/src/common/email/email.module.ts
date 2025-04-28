import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule], // EmailService depends on ConfigService
  providers: [EmailService],
  exports: [EmailService], // Export EmailService so other modules can use it
})
export class EmailModule {}
