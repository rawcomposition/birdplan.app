import { Module, Global } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { ConfigModule } from '@nestjs/config'; // ConfigService is used by MapboxService

@Global() // Make MapboxService available globally
@Module({
  imports: [ConfigModule], // Import ConfigModule here
  providers: [MapboxService],
  exports: [MapboxService],
})
export class MapboxModule {}
