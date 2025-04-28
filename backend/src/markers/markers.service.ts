import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument, Marker } from '../trips/entities/trip.entity';
import { MarkerDto } from './dto/marker.dto';
import { UpdateMarkerNotesDto } from './dto/update-marker-notes.dto';

@Injectable()
export class MarkersService {
  private readonly logger = new Logger(MarkersService.name);

  constructor(@InjectModel(Trip.name) private tripModel: Model<TripDocument>) {}

  // Helper to find trip and check user authorization
  private async findTripAndCheckAuth(
    tripId: string,
    userId: string,
  ): Promise<TripDocument> {
    const trip = await this.tripModel.findById(tripId).exec();
    if (!trip) {
      this.logger.warn(
        `Trip ${tripId} not found during marker operation by user ${userId}`,
      );
      throw new NotFoundException(`Trip not found`);
    }
    if (!trip.userIds.includes(userId)) {
      this.logger.warn(
        `User ${userId} forbidden to modify markers for trip ${tripId}`,
      );
      throw new ForbiddenException('Forbidden');
    }
    return trip;
  }

  async addMarker(
    tripId: string,
    markerDto: MarkerDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Adding marker ${markerDto.id} to trip ${tripId} by user ${userId}`,
    );
    const trip = await this.findTripAndCheckAuth(tripId, userId);

    const markerExists = trip.markers?.some((m) => m.id === markerDto.id);
    if (markerExists) {
      this.logger.warn(
        `Marker ${markerDto.id} already exists in trip ${tripId}`,
      );
      return; // Mimic original API (200 OK)
    }

    try {
      await this.tripModel
        .updateOne(
          { _id: tripId },
          { $push: { markers: markerDto as Marker } }, // Cast DTO
        )
        .exec();
      this.logger.log(
        `Successfully added marker ${markerDto.id} to trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add marker ${markerDto.id} to trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error adding marker');
    }
  }

  async removeMarker(
    tripId: string,
    markerId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Removing marker ${markerId} from trip ${tripId} by user ${userId}`,
    );
    await this.findTripAndCheckAuth(tripId, userId); // Auth check

    try {
      const updateResult = await this.tripModel
        .updateOne({ _id: tripId }, { $pull: { markers: { id: markerId } } })
        .exec();

      if (updateResult.modifiedCount === 0) {
        this.logger.warn(
          `Marker ${markerId} not found in trip ${tripId} during removal attempt.`,
        );
        // Mimic original - no error if marker wasn't found
      }

      this.logger.log(
        `Successfully removed marker ${markerId} from trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove marker ${markerId} from trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error removing marker');
    }
  }

  async updateNotes(
    tripId: string,
    markerId: string,
    updateNotesDto: UpdateMarkerNotesDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Updating notes for marker ${markerId} in trip ${tripId} by user ${userId}`,
    );
    await this.findTripAndCheckAuth(tripId, userId); // Auth check

    try {
      const result = await this.tripModel
        .updateOne(
          { _id: tripId, 'markers.id': markerId },
          { $set: { 'markers.$.notes': updateNotesDto.notes } },
        )
        .exec();

      if (result.matchedCount === 0) {
        this.logger.warn(
          `Trip ${tripId} or Marker ${markerId} not found for notes update.`,
        );
        // Mimic original
      }
      this.logger.log(
        `Successfully updated notes for marker ${markerId} in trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update notes for marker ${markerId} in trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error saving marker notes');
    }
  }
}
