import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EbirdService } from './ebird.service';

@Global() // Make EbirdService globally available
@Module({
  imports: [
    HttpModule, // Import HttpModule for HttpService
    ConfigModule, // Import ConfigModule for ConfigService used by EbirdService
  ],
  providers: [EbirdService],
  exports: [EbirdService],
})
export class EbirdModule {}
