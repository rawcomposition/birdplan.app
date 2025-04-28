import { Module, Global } from '@nestjs/common';
import { GeoService } from './geo.service';

@Global() // Make GeoService available globally
@Module({
  providers: [GeoService],
  exports: [GeoService],
})
export class HelpersModule {}
