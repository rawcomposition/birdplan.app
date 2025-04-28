import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession } from 'mongoose';
import { Profile, ProfileDocument } from './entities/profile.entity';
import { Trip, TripDocument } from '../trips/entities/trip.entity';
import {
  TargetList,
  TargetListDocument,
} from '../targets/entities/target-list.entity';
import { Invite, InviteDocument } from '../invites/entities/invite.entity';
import { AuthService } from '../auth/auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as admin from 'firebase-admin'; // Import firebase-admin for user deletion/lookup
import { EbirdService } from '../external/ebird/ebird.service'; // Import EbirdService
// TODO: Import EbirdService when implemented

// Define a type for the lean result
type LeanProfile = Omit<Profile, '_'> & {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(TargetList.name)
    private targetListModel: Model<TargetListDocument>,
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    @InjectConnection() private readonly connection: Connection,
    private authService: AuthService, // For getting user info
    private ebirdService: EbirdService, // Inject EbirdService
  ) {}

  async getMyProfile(uid: string): Promise<LeanProfile> {
    this.logger.log(`Fetching profile for user ${uid}`);

    // Update lastActiveAt asynchronously, don't wait for it
    this.profileModel
      .updateOne({ uid }, { lastActiveAt: new Date() })
      .exec()
      .catch((err) => {
        this.logger.error(
          `Failed background update of lastActiveAt for user ${uid}: ${err.message}`,
        );
      });

    let profile = await this.profileModel
      .findOne({ uid })
      .lean<LeanProfile>()
      .exec();

    if (!profile) {
      this.logger.log(`Profile not found for user ${uid}, creating new one.`);
      try {
        // Fetch user info from Firebase Auth
        const userRecord = await admin.auth().getUser(uid);
        const newProfileData = {
          uid: uid,
          name: userRecord.displayName,
          email: userRecord.email,
        };
        const createdProfile = new this.profileModel(newProfileData);
        await createdProfile.save();
        this.logger.log(`Created new profile for user ${uid}`);
        profile = createdProfile.toObject<LeanProfile>(); // Convert to plain object
      } catch (error) {
        this.logger.error(
          `Failed to create profile for user ${uid} after fetching from Firebase: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException('Error creating user profile');
      }
    }

    // Check if name is missing and try to update from Firebase (like original)
    if (!profile.name) {
      this.logger.log(
        `Profile name missing for user ${uid}, attempting update from Firebase.`,
      );
      try {
        const userRecord = await admin.auth().getUser(uid);
        if (userRecord.displayName) {
          await this.profileModel
            .updateOne({ uid }, { name: userRecord.displayName })
            .exec();
          profile.name = userRecord.displayName;
          this.logger.log(
            `Updated profile name for user ${uid} from Firebase.`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to update profile name for user ${uid} from Firebase: ${error.message}`,
        );
        // Don't fail the request, just log the error
      }
    }

    return profile;
  }

  async updateMyProfile(
    uid: string,
    updateDto: UpdateProfileDto,
  ): Promise<void> {
    this.logger.log(`Updating profile for user ${uid}`);

    const { lifelistSci, ...restOfDto } = updateDto;
    const updateData: Partial<Profile> = { ...restOfDto };

    if (lifelistSci && lifelistSci.length > 0) {
      this.logger.log(
        `Attempting to convert ${lifelistSci.length} scientific names to codes for user ${uid}`,
      );
      try {
        const codes =
          await this.ebirdService.convertSciNameToCodes(lifelistSci);
        updateData.lifelist = codes;
        this.logger.log(
          `Successfully converted to ${codes.length} codes for user ${uid}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to convert lifelist scientific names for user ${uid}: ${error.message}. Skipping lifelist update.`,
        );
        // Optionally re-throw or handle differently if conversion failure should block update
        // throw new InternalServerErrorException('Failed to process lifelist for update');
      }
    } else if (updateDto.hasOwnProperty('lifelistSci')) {
      // If lifelistSci is provided (even as empty array), clear the lifelist
      this.logger.log(`Clearing lifelist for user ${uid}`);
      updateData.lifelist = [];
    }

    try {
      const result = await this.profileModel
        .updateOne({ uid }, updateData)
        .exec();
      if (result.matchedCount === 0) {
        this.logger.error(`Profile update failed: User ${uid} not found.`);
        throw new NotFoundException('Profile not found');
      }
      this.logger.log(`Profile updated successfully for user ${uid}`);
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${uid}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error updating profile');
    }
  }

  async deleteMyAccount(uid: string): Promise<void> {
    this.logger.warn(`Initiating account deletion for user ${uid}`);
    const session = await this.connection.startSession();

    try {
      session.startTransaction();
      this.logger.log(`[Delete Account ${uid}] Starting transaction.`);

      // Find owned trips
      const trips = await this.tripModel
        .find({ ownerId: uid })
        .select('_id')
        .session(session)
        .lean()
        .exec();
      const tripIds = trips.map((trip) => trip._id);
      this.logger.log(
        `[Delete Account ${uid}] Found ${tripIds.length} owned trips.`,
      );

      // Perform deletions within transaction
      const profileDelete = this.profileModel
        .deleteOne({ uid })
        .session(session)
        .exec();
      const targetListDelete =
        tripIds.length > 0
          ? this.targetListModel
              .deleteMany({ tripId: { $in: tripIds } })
              .session(session)
              .exec()
          : Promise.resolve();
      const ownedInvitesDelete =
        tripIds.length > 0
          ? this.inviteModel
              .deleteMany({ tripId: { $in: tripIds } })
              .session(session)
              .exec()
          : Promise.resolve();
      const userInvitesDelete = this.inviteModel
        .deleteMany({ uid })
        .session(session)
        .exec();
      const ownedTripsDelete =
        tripIds.length > 0
          ? this.tripModel.deleteMany({ ownerId: uid }).session(session).exec()
          : Promise.resolve();
      const tripMembershipPull = this.tripModel
        .updateMany(
          { userIds: uid, ownerId: { $ne: uid } },
          { $pull: { userIds: uid } },
        )
        .session(session)
        .exec();

      await Promise.all([
        profileDelete,
        targetListDelete,
        ownedInvitesDelete,
        userInvitesDelete,
        ownedTripsDelete,
        tripMembershipPull,
      ]);
      this.logger.log(
        `[Delete Account ${uid}] Database records deleted/updated within transaction.`,
      );

      // Delete Firebase user (outside transaction)
      try {
        await admin.auth().deleteUser(uid);
        this.logger.log(`[Delete Account ${uid}] Firebase Auth user deleted.`);
      } catch (firebaseError) {
        this.logger.error(
          `[Delete Account ${uid}] Failed to delete Firebase Auth user. Database transaction will be rolled back. Error: ${firebaseError.message}`,
          firebaseError.stack,
        );
        throw new InternalServerErrorException(
          'Failed to complete account deletion process (auth cleanup).',
        );
      }

      await session.commitTransaction();
      this.logger.log(
        `[Delete Account ${uid}] Transaction committed successfully.`,
      );
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `[Delete Account ${uid}] Transaction aborted. Error: ${error.message}`,
        error.stack,
      );
      if (error instanceof InternalServerErrorException) throw error;
      throw new InternalServerErrorException('Error deleting account');
    } finally {
      session.endSession();
    }
  }
}
