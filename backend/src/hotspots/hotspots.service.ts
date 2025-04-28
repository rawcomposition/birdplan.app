import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose'; // Import Connection for potential transactions
import { Trip, TripDocument, Hotspot } from '../trips/entities/trip.entity';
import { TargetsService } from '../targets/targets.service';
import { HotspotDto, HotspotFavDto } from './dto/hotspot.dto';
import { TargetListType } from '../trips/trips.service'; // Reuse enum
import { UpdateHotspotNotesDto } from './dto/update-hotspot-notes.dto';
import { RemoveHotspotFavDto } from './dto/remove-hotspot-fav.dto';

@Injectable()
export class HotspotsService {
  private readonly logger = new Logger(HotspotsService.name);

  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectConnection() private readonly connection: Connection, // For transactions
    private targetsService: TargetsService,
  ) {}

  private async findTripAndCheckAuth(
    tripId: string,
    userId: string,
  ): Promise<TripDocument> {
    const trip = await this.tripModel.findById(tripId).exec();
    if (!trip) {
      this.logger.warn(
        `Trip ${tripId} not found during hotspot operation by user ${userId}`,
      );
      throw new NotFoundException(`Trip not found`);
    }
    if (!trip.userIds.includes(userId)) {
      this.logger.warn(
        `User ${userId} forbidden to modify hotspots for trip ${tripId}`,
      );
      throw new ForbiddenException('Forbidden');
    }
    return trip;
  }

  async addHotspot(
    tripId: string,
    hotspotDto: HotspotDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Adding hotspot ${hotspotDto.id} to trip ${tripId} by user ${userId}`,
    );
    const trip = await this.findTripAndCheckAuth(tripId, userId);

    const hotspotExists = trip.hotspots?.some((h) => h.id === hotspotDto.id);
    if (hotspotExists) {
      this.logger.warn(
        `Hotspot ${hotspotDto.id} already exists in trip ${tripId}`,
      );
      // Original API returned {} (200 OK), we might prefer Conflict 409 or just return void
      // throw new ConflictException('Hotspot already exists in this trip');
      return; // Mimic original behavior (effectively 200 OK)
    }

    try {
      // Use $push to add to the array atomically
      await this.tripModel
        .updateOne(
          { _id: tripId },
          { $push: { hotspots: hotspotDto as Hotspot } }, // Cast DTO to Hotspot type
        )
        .exec();
      this.logger.log(
        `Successfully added hotspot ${hotspotDto.id} to trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add hotspot ${hotspotDto.id} to trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error adding hotspot');
    }
  }

  async removeHotspot(
    tripId: string,
    hotspotId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Removing hotspot ${hotspotId} from trip ${tripId} by user ${userId}`,
    );
    await this.findTripAndCheckAuth(tripId, userId); // Auth check

    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      this.logger.log(
        `Starting transaction to remove hotspot ${hotspotId} from trip ${tripId}`,
      );

      // Delete related target lists first
      await this.targetsService.deleteManyByTripAndType(
        tripId,
        TargetListType.hotspot,
        session,
      );

      // Pull hotspot from array
      const updateResult = await this.tripModel
        .updateOne({ _id: tripId }, { $pull: { hotspots: { id: hotspotId } } })
        .session(session)
        .exec();

      if (updateResult.modifiedCount === 0) {
        // Could mean hotspot didn't exist, or trip didn't exist (already checked)
        this.logger.warn(
          `Hotspot ${hotspotId} not found in trip ${tripId} during removal attempt.`,
        );
        // We could throw NotFoundException here, but original didn't error if hotspot wasn't found
      }

      await session.commitTransaction();
      this.logger.log(
        `Successfully removed hotspot ${hotspotId} from trip ${tripId}`,
      );
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to remove hotspot ${hotspotId} from trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error removing hotspot');
    } finally {
      session.endSession();
    }
  }

  async updateNotes(
    tripId: string,
    hotspotId: string,
    updateNotesDto: UpdateHotspotNotesDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Updating notes for hotspot ${hotspotId} in trip ${tripId} by user ${userId}`,
    );
    await this.findTripAndCheckAuth(tripId, userId); // Auth check

    try {
      const result = await this.tripModel
        .updateOne(
          { _id: tripId, 'hotspots.id': hotspotId },
          { $set: { 'hotspots.$.notes': updateNotesDto.notes } },
        )
        .exec();

      if (result.matchedCount === 0) {
        this.logger.warn(
          `Trip ${tripId} or Hotspot ${hotspotId} not found for notes update.`,
        );
        // Could throw NotFoundException if hotspot must exist, but mimicking original which didn't error
      }
      this.logger.log(
        `Successfully updated notes for hotspot ${hotspotId} in trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update notes for hotspot ${hotspotId} in trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error saving notes');
    }
  }

  async addSpeciesFav(
    tripId: string,
    hotspotId: string,
    favDto: HotspotFavDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Adding species fav ${favDto.code} to hotspot ${hotspotId} in trip ${tripId} by user ${userId}`,
    );
    const trip = await this.findTripAndCheckAuth(tripId, userId); // Auth check and get trip

    // Check if hotspot exists within the fetched trip
    const hotspot = trip.hotspots?.find((h) => h.id === hotspotId);
    if (!hotspot) {
      this.logger.warn(
        `Hotspot ${hotspotId} not found within trip ${tripId} for adding fav.`,
      );
      throw new NotFoundException(`Hotspot not found`);
    }

    // Check if fav already exists (mimic original logic)
    const favExists = hotspot.favs?.some((f) => f.code === favDto.code);
    if (favExists) {
      this.logger.warn(
        `Fav ${favDto.code} already exists for hotspot ${hotspotId} in trip ${tripId}`,
      );
      return; // Mimic original behavior (200 OK)
    }

    try {
      // Use $push with positional operator
      await this.tripModel
        .updateOne(
          { _id: tripId, 'hotspots.id': hotspotId },
          { $push: { 'hotspots.$.favs': favDto } },
        )
        .exec();
      this.logger.log(
        `Successfully added species fav ${favDto.code} to hotspot ${hotspotId} in trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to add species fav ${favDto.code} to hotspot ${hotspotId} in trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error adding species favorite');
    }
  }

  async removeSpeciesFav(
    tripId: string,
    hotspotId: string,
    removeFavDto: RemoveHotspotFavDto,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `Removing species fav ${removeFavDto.code} from hotspot ${hotspotId} in trip ${tripId} by user ${userId}`,
    );
    await this.findTripAndCheckAuth(tripId, userId); // Auth check
    // We don't strictly need the trip doc here, but the auth check is important.
    // Original logic fetched the trip first to check if hotspot exists, we can skip that for $pull

    try {
      // Use $pull with positional operator
      const result = await this.tripModel
        .updateOne(
          { _id: tripId, 'hotspots.id': hotspotId },
          { $pull: { 'hotspots.$.favs': { code: removeFavDto.code } } },
        )
        .exec();

      if (result.matchedCount === 0) {
        this.logger.warn(
          `Trip ${tripId} or Hotspot ${hotspotId} not found for removing fav.`,
        );
        // Could throw NotFoundException, but mimic original
      } else if (result.modifiedCount === 0) {
        this.logger.warn(
          `Fav ${removeFavDto.code} not found on hotspot ${hotspotId} in trip ${tripId}, or already removed.`,
        );
        // Mimic original - no error if fav wasn't found
      }

      this.logger.log(
        `Successfully removed species fav ${removeFavDto.code} from hotspot ${hotspotId} in trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove species fav ${removeFavDto.code} from hotspot ${hotspotId} in trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error removing species favorite');
    }
  }

  // TODO: Implement other hotspot-specific methods (update notes, add/remove favs, etc.)
}
