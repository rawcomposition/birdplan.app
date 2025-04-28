import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { ConfigModule } from '@nestjs/config'; // Needed for ConfigService
import { EmailModule } from '../common/email/email.module'; // Import EmailModule

@Module({
  imports: [ConfigModule, EmailModule], // Add EmailModule here
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
