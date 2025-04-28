import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import axios from 'axios';
import { nanoid } from 'nanoid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private storageBucketName: string;

  constructor(private configService: ConfigService) {
    // Attempt to get bucket name from initialized admin app, fallback from env if needed
    try {
      this.storageBucketName =
        admin.app().options.storageBucket ||
        this.configService.getOrThrow('FIREBASE_STORAGE_BUCKET');
      if (!this.storageBucketName)
        throw new Error('Storage bucket name not found');
      this.logger.log(
        `Using Firebase Storage bucket: ${this.storageBucketName}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to determine Firebase Storage bucket name. Ensure Admin SDK is initialized and FIREBASE_STORAGE_BUCKET is set if needed.',
        error.stack,
      );
      throw new Error('Firebase Storage bucket configuration error.');
    }
  }

  async uploadMapboxImage(mapboxImageUrl: string): Promise<string | null> {
    const id = nanoid(16);
    this.logger.log(
      `Attempting to upload mapbox image for id: ${id}, from url: ${mapboxImageUrl}`,
    );

    try {
      const response = await axios.get(mapboxImageUrl, {
        responseType: 'arraybuffer',
      });

      if (response.status !== 200) {
        this.logger.warn(
          `Failed to load Mapbox image (Status: ${response.status}): ${mapboxImageUrl}`,
        );
        return null; // Don't throw error, return null as per original logic
      }

      const buffer = Buffer.from(response.data);
      const fileName = `${id}.png`;
      const storage = getStorage().bucket(this.storageBucketName);
      const file = storage.file(fileName);

      const stream = file.createWriteStream({
        metadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000', // Optional: Add cache control
        },
        public: true, // Make the file public directly
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          this.logger.error(
            `Firebase Storage upload stream error for ${fileName}: ${err.message}`,
            err.stack,
          );
          reject(
            new InternalServerErrorException(
              'Failed to upload image to storage',
            ),
          );
        });
        stream.on('finish', () => {
          // Construct the public URL (ensure bucket name is correct)
          const url = `https://storage.googleapis.com/${this.storageBucketName}/${fileName}`;
          this.logger.log(`Successfully uploaded Mapbox image to: ${url}`);
          resolve(url);
        });
        stream.end(buffer);
      });
    } catch (error) {
      // Catch errors from axios request or stream promise creation
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Axios error fetching Mapbox image ${mapboxImageUrl}: ${error.message}`,
        );
      } else {
        this.logger.error(
          `Error during Mapbox image upload process for ${mapboxImageUrl}: ${error.message}`,
          error.stack,
        );
      }
      // As per original logic, return null if image fetch fails, don't throw an exception for this specific step
      // unless it's an unrecoverable storage configuration issue (handled in constructor).
      return null;
    }
  }
}
