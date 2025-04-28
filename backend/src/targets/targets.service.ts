import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  TargetList,
  TargetListDocument,
  TargetListItem,
} from './entities/target-list.entity';
import { Trip, TripDocument } from '../trips/entities/trip.entity';
import {
  UpsertTargetListDto,
  SetTargetNotesDto,
  TargetStarDto,
} from './dto/target-list.dto';
import { TargetListType } from '../trips/trips.service';

// Define a type for the lean result
type LeanTargetList = Omit<TargetList, '_'> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Type for the Mongoose query filter
interface TargetListFilter {
  type: TargetListType;
  tripId: string;
  hotspotId?: string;
}

@Injectable()
export class TargetsService {
  private readonly logger = new Logger(TargetsService.name);

  constructor(
    @InjectModel(TargetList.name)
    private targetListModel: Model<TargetListDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}

  async findTargets(
    tripId: string,
    hotspotId?: string,
  ): Promise<LeanTargetList | null> {
    const type = hotspotId ? TargetListType.hotspot : TargetListType.trip;
    this.logger.log(
      `Finding targets for type=${type}, tripId=${tripId}${hotspotId ? ', hotspotId=' + hotspotId : ''}`,
    );

    const query: TargetListFilter = { type, tripId };
    if (hotspotId) {
      query.hotspotId = hotspotId;
    }

    try {
      const targetList = await this.targetListModel
        .findOne(query)
        .sort({ createdAt: -1 })
        .lean<LeanTargetList>()
        .exec();

      if (!targetList) {
        this.logger.log(
          `No target list found for query: ${JSON.stringify(query)}`,
        );
        return null;
      }
      this.logger.log(`Target list found for query: ${JSON.stringify(query)}`);
      return targetList;
    } catch (error) {
      this.logger.error(
        `Error finding target list for query ${JSON.stringify(query)}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error loading targets');
    }
  }

  async upsertTargets(
    tripId: string,
    upsertDto: UpsertTargetListDto,
    hotspotId?: string,
  ): Promise<{ id: string }> {
    const type = hotspotId ? TargetListType.hotspot : TargetListType.trip;
    this.logger.log(
      `Upserting targets for type=${type}, tripId=${tripId}${hotspotId ? ', hotspotId=' + hotspotId : ''}`,
    );

    const filter: TargetListFilter = { type, tripId };
    if (hotspotId) {
      filter.hotspotId = hotspotId;
    }

    const updateData = {
      ...upsertDto,
      type,
      tripId,
      hotspotId: hotspotId || undefined,
    };

    try {
      const targetList = await this.targetListModel
        .findOneAndUpdate(filter, updateData, { upsert: true, new: true })
        .exec();

      if (hotspotId && targetList?._id) {
        await this.tripModel
          .updateOne(
            { _id: tripId, 'hotspots.id': hotspotId },
            { $set: { 'hotspots.$.targetsId': targetList._id } },
          )
          .exec();
        this.logger.log(
          `Updated targetsId for hotspot ${hotspotId} in trip ${tripId}`,
        );
      }

      this.logger.log(
        `Targets successfully upserted with id: ${targetList._id}`,
      );
      return { id: targetList._id };
    } catch (error) {
      this.logger.error(
        `Error upserting targets for filter ${JSON.stringify(filter)}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error saving targets');
    }
  }

  async setTargetNotes(
    tripId: string,
    notesDto: SetTargetNotesDto,
  ): Promise<void> {
    this.logger.log(
      `Setting target notes for trip ${tripId}, key: ${notesDto.key}`,
    );
    try {
      const update = { [`targetNotes.${notesDto.key}`]: notesDto.value };
      if (
        notesDto.value === undefined ||
        notesDto.value === null ||
        notesDto.value === ''
      ) {
        update[`targetNotes.${notesDto.key}`] = undefined;
        await this.tripModel
          .updateOne(
            { _id: tripId },
            { $unset: { [`targetNotes.${notesDto.key}`]: '' } },
          )
          .exec();
      } else {
        await this.tripModel
          .updateOne({ _id: tripId }, { $set: update })
          .exec();
      }
      this.logger.log(
        `Successfully set notes for key ${notesDto.key} on trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error setting notes for key ${notesDto.key} on trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error setting target notes');
    }
  }

  async addTargetStar(tripId: string, starDto: TargetStarDto): Promise<void> {
    this.logger.log(
      `Adding target star for code ${starDto.code} to trip ${tripId}`,
    );
    try {
      await this.tripModel
        .updateOne(
          { _id: tripId },
          { $addToSet: { targetStars: starDto.code } },
        )
        .exec();
      this.logger.log(
        `Successfully added star for code ${starDto.code} to trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error adding star for code ${starDto.code} to trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error adding target star');
    }
  }

  async removeTargetStar(
    tripId: string,
    starDto: TargetStarDto,
  ): Promise<void> {
    this.logger.log(
      `Removing target star for code ${starDto.code} from trip ${tripId}`,
    );
    try {
      await this.tripModel
        .updateOne({ _id: tripId }, { $pull: { targetStars: starDto.code } })
        .exec();
      this.logger.log(
        `Successfully removed star for code ${starDto.code} from trip ${tripId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error removing star for code ${starDto.code} from trip ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error removing target star');
    }
  }

  async deleteManyByTrip(
    tripId: string,
    session?: ClientSession,
  ): Promise<{ deletedCount?: number }> {
    this.logger.log(`Deleting all target lists for tripId: ${tripId}`);
    try {
      const result = await this.targetListModel
        .deleteMany({ tripId })
        .session(session ?? null)
        .exec();
      this.logger.log(
        `Deleted ${result.deletedCount} target lists for tripId: ${tripId}`,
      );
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error(
        `Failed to delete target lists for tripId ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error deleting related target lists',
      );
    }
  }

  async deleteManyByTripAndType(
    tripId: string,
    type: string,
    session?: ClientSession,
  ): Promise<{ deletedCount?: number }> {
    this.logger.log(
      `Deleting target lists for tripId: ${tripId} and type: ${type}`,
    );
    try {
      const result = await this.targetListModel
        .deleteMany({ tripId, type })
        .session(session ?? null)
        .exec();
      this.logger.log(
        `Deleted ${result.deletedCount} target lists for tripId: ${tripId}, type: ${type}`,
      );
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error(
        `Failed to delete target lists for tripId ${tripId}, type ${type}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Error deleting related target lists',
      );
    }
  }

  // Add other CRUD methods here later as needed
}
