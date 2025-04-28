import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  NotImplementedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Trip, TripDocument } from './entities/trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
import { GeoService } from '../helpers/geo.service';
import { MapboxService } from '../external/mapbox/mapbox.service';
import { StorageService } from '../external/storage/storage.service';
import { TargetsService } from '../targets/targets.service';
import { InvitesService } from '../invites/invites.service';

// Define a type for the lean result, essentially the Trip class properties plus _id
// Omit Mongoose document properties like __v, save, etc.
// Note: We might need to refine this further if deep nested types cause issues
type LeanTrip = Omit<Trip, '_'> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}; // Add timestamps if needed from lean()

// TODO: Get this enum from a shared location if possible
export enum TargetListType {
  trip = 'trip',
  hotspot = 'hotspot',
}

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectConnection() private readonly connection: Connection,
    private geoService: GeoService,
    private mapboxService: MapboxService,
    private storageService: StorageService,
    private targetsService: TargetsService,
    private invitesService: InvitesService,
  ) {}

  async create(
    createTripDto: CreateTripDto,
    user: DecodedIdToken,
  ): Promise<{ id: string }> {
    this.logger.log(
      `Creating trip '${createTripDto.name}' for user ${user.uid}`,
    );
    try {
      const bounds = await this.geoService.getBounds(createTripDto.region);
      if (!bounds) {
        this.logger.error(
          `Failed to get bounds for region: ${createTripDto.region}`,
        );
        throw new InternalServerErrorException(
          'Failed to process region information to get map bounds.',
        );
      }

      const { lat, lng } = this.geoService.getCenterOfBounds(bounds);
      const timezone = this.geoService.getTimezone(lat, lng);
      const mapboxImgUrl = this.mapboxService.getStaticImageUrl(bounds);

      // Fetch and upload image - this returns null if fetching the Mapbox image fails
      const imgUrl = await this.storageService.uploadMapboxImage(mapboxImgUrl);

      const newTripData = {
        ...createTripDto,
        userIds: [user.uid],
        ownerId: user.uid,
        ownerName: user.name || user.email,
        bounds,
        timezone,
        imgUrl,
        itinerary: [],
        hotspots: [],
        markers: [],
      };

      const createdTrip = new this.tripModel(newTripData);
      await createdTrip.save();
      this.logger.log(`Trip ${createdTrip._id} created successfully.`);
      return { id: createdTrip._id };
    } catch (error) {
      // Catch specific exceptions from downstream services if needed, otherwise log and rethrow generic
      this.logger.error(`Failed to create trip: ${error.message}`, error.stack);
      // Check if it's an error we already threw
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // TODO: Add more specific error handling (e.g., Mongoose validation errors)
      throw new InternalServerErrorException('Error creating trip');
    }
  }

  async findAllByUser(userId: string): Promise<LeanTrip[]> {
    this.logger.log(`Finding all trips for user ${userId}`);
    try {
      return await this.tripModel
        .find({ userIds: userId })
        .sort({ createdAt: -1 })
        .lean<LeanTrip[]>()
        .exec();
    } catch (error) {
      this.logger.error(
        `Failed to find trips for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error loading trips');
    }
  }

  async findOne(id: string, userId?: string): Promise<LeanTrip> {
    this.logger.log(`Finding trip ${id}`);
    const trip = await this.tripModel.findById(id).lean<LeanTrip>().exec();

    if (!trip) {
      this.logger.warn(`Trip ${id} not found`);
      throw new NotFoundException(`Trip not found`);
    }

    // Check access for non-public trips
    if (!trip.isPublic && (!userId || !trip.userIds.includes(userId))) {
      this.logger.warn(
        `User ${userId || 'anonymous'} forbidden access to trip ${id}`,
      );
      throw new ForbiddenException('Access denied');
    }

    this.logger.log(`Trip ${id} found successfully.`);
    return trip;
  }

  async update(
    id: string,
    updateTripDto: UpdateTripDto,
    userId: string,
  ): Promise<{ hasChangedDates: boolean }> {
    this.logger.log(`Updating trip ${id} by user ${userId}`);

    let session: ClientSession | null = null; // Initialize session as null

    try {
      // Fetch trip first (outside transaction initially)
      const trip = await this.tripModel.findById(id).exec();

      if (!trip) {
        this.logger.warn(`Update failed: Trip ${id} not found`);
        throw new NotFoundException(`Trip not found`);
      }

      if (!trip.userIds.includes(userId)) {
        this.logger.warn(`User ${userId} forbidden to update trip ${id}`);
        throw new ForbiddenException('Forbidden');
      }

      const hasChangedDates =
        updateTripDto.startMonth !== undefined &&
        updateTripDto.endMonth !== undefined &&
        (updateTripDto.startMonth !== trip.startMonth ||
          updateTripDto.endMonth !== trip.endMonth);

      Object.assign(trip, updateTripDto);

      // Start transaction ONLY if dates have changed
      if (hasChangedDates) {
        session = await this.connection.startSession();
        session.startTransaction();
        this.logger.log(
          `Trip ${id} dates changed, starting transaction to clear related data.`,
        );

        // Pass the session to the dependent service
        await this.targetsService.deleteManyByTripAndType(
          id,
          TargetListType.hotspot,
          session,
        );

        trip.hotspots =
          trip.hotspots?.map(({ targetsId, ...hotspot }) => hotspot) || [];
      }

      await trip.save({ session: session ?? undefined }); // Pass session (or undefined) to save

      if (session) await session.commitTransaction(); // Commit only if transaction was started
      this.logger.log(`Trip ${id} updated successfully.`);
      return { hasChangedDates };
    } catch (error) {
      if (session) await session.abortTransaction(); // Abort only if transaction was started
      this.logger.error(
        `Failed to update trip ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error; // Rethrow specific http exceptions
      }
      throw new InternalServerErrorException('Error updating trip');
    } finally {
      if (session) session.endSession(); // End only if transaction was started
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    this.logger.log(`Attempting to remove trip ${id} by user ${userId}`);
    // Check ownership first (no need for transaction yet)
    const trip = await this.tripModel
      .findById(id)
      .select('ownerId')
      .lean()
      .exec();

    if (!trip) {
      this.logger.warn(`Removal failed: Trip ${id} not found`);
      throw new NotFoundException(`Trip not found`);
    }

    if (trip.ownerId !== userId) {
      this.logger.warn(`User ${userId} forbidden to delete trip ${id}`);
      throw new ForbiddenException('Forbidden');
    }

    // Start transaction for the actual deletions
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      this.logger.log(
        `Starting transaction to remove trip ${id} and related data.`,
      );

      // Delete related data first within the transaction
      await this.targetsService.deleteManyByTrip(id, session);
      await this.invitesService.deleteManyByTrip(id, session);

      // Then delete the trip itself within the transaction
      const deleteResult = await this.tripModel
        .deleteOne({ _id: id })
        .session(session)
        .exec();

      if (deleteResult.deletedCount === 0) {
        // This case should ideally be rare if the initial check passed
        this.logger.error(
          `Transaction aborted: Trip ${id} found initially but failed to delete during transaction.`,
        );
        throw new InternalServerErrorException(
          'Error deleting trip - consistency issue detected',
        );
      }

      await session.commitTransaction();
      this.logger.log(`Trip ${id} and related data removed successfully.`);
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Transaction failed for removing trip ${id}: ${error.message}`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) {
        throw error; // Rethrow specific internal errors
      }
      throw new InternalServerErrorException('Error deleting trip');
    } finally {
    }
  }
}
