import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bounds } from '../../trips/entities/trip.entity';

@Injectable()
export class MapboxService {
  private readonly logger = new Logger(MapboxService.name);
  private readonly mapboxServerKey: string;

  constructor(private configService: ConfigService) {
    const serverKey = this.configService.get<string>('MAPBOX_SERVER_KEY');
    if (!serverKey) {
      this.logger.error('MAPBOX_SERVER_KEY is not configured in .env');
      throw new Error('Mapbox Server Key is missing');
    }
    this.mapboxServerKey = serverKey;
  }

  getStaticImageUrl(bounds: Bounds): string {
    const url = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/[${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY}]/300x185@2x?access_token=${this.mapboxServerKey}&padding=30`;
    this.logger.log(
      `Generated Mapbox static URL for bounds: ${JSON.stringify(bounds)}`,
    );
    return url;
  }
}
