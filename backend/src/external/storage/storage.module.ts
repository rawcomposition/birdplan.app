import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { ConfigModule } from '@nestjs/config'; // ConfigService is used by StorageService

@Global() // Make StorageService available globally
@Module({
  imports: [ConfigModule], // Import ConfigModule here
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
