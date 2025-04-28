import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as geoTz from 'geo-tz';
import { Bounds } from '../trips/entities/trip.entity'; // Assuming Bounds is defined here

// Interface for the relevant part of the eBird API response
interface EbirdRegionInfo {
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly ebirdApiKey: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('NEXT_PUBLIC_EBIRD_KEY');
    if (!apiKey) {
      this.logger.error('NEXT_PUBLIC_EBIRD_KEY is not configured in .env');
      throw new Error('eBird API key is missing');
    }
    this.ebirdApiKey = apiKey;
  }

  async getBounds(regionString: string): Promise<Bounds | null> {
    this.logger.log(`Fetching bounds for region(s): ${regionString}`);
    const regions = regionString.split(',');
    const boundsPromises = regions.map(async (region) => {
      const url = `https://api.ebird.org/v2/ref/region/info/${region}`;
      try {
        const response = await axios.get<EbirdRegionInfo>(url, {
          headers: { 'X-eBirdApiToken': this.ebirdApiKey },
        });
        return response.data.bounds;
      } catch (error) {
        this.logger.error(
          `Failed to fetch eBird region info for ${region}: ${error.message}`,
        );
        // Allow failure for a single region, return null bounds for it
        return null;
      }
    });

    try {
      const boundsResults = await Promise.all(boundsPromises);
      const validBounds = boundsResults.filter((b) => b !== null);

      if (validBounds.length === 0) {
        this.logger.error(
          `No valid bounds found for region string: ${regionString}`,
        );
        return null; // Return null if no regions yielded bounds
      }

      const combinedBounds = validBounds.reduce(
        (acc, bounds) => {
          return {
            minX: Math.min(acc.minX, bounds.minX),
            maxX: Math.max(acc.maxX, bounds.maxX),
            minY: Math.min(acc.minY, bounds.minY),
            maxY: Math.max(acc.maxY, bounds.maxY),
          };
        },
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      );

      this.logger.log(
        `Successfully fetched combined bounds for ${regionString}`,
      );
      return combinedBounds;
    } catch (error) {
      this.logger.error(
        `Error processing bounds requests for ${regionString}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to process region bounds information',
      );
    }
  }

  getCenterOfBounds(bounds: Bounds): { lat: number; lng: number } {
    const lat = (bounds.minY + bounds.maxY) / 2;
    const lng = (bounds.minX + bounds.maxX) / 2;
    this.logger.log(`Calculated center: lat=${lat}, lng=${lng}`);
    return { lat, lng };
  }

  getTimezone(lat: number, lng: number): string {
    try {
      const timezones = geoTz.find(lat, lng);
      const timezone = timezones.length > 0 ? timezones[0] : 'Etc/UTC';
      this.logger.log(`Found timezone ${timezone} for lat=${lat}, lng=${lng}`);
      return timezone;
    } catch (error) {
      this.logger.error(
        `Failed to find timezone for lat=${lat}, lng=${lng}: ${error.message}`,
        error.stack,
      );
      // Fallback to UTC if geo-tz fails
      return 'Etc/UTC';
    }
  }
}
