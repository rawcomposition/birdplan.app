import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Invite, InviteDocument } from './entities/invite.entity';
import { EmailService } from '../common/email/email.service';
import { ConfigService } from '@nestjs/config';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InvitesService {
  private readonly logger = new Logger(InvitesService.name);

  constructor(
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async createAndSendInvite(
    createInviteDto: CreateInviteDto,
    senderUserId: string,
  ): Promise<void> {
    const { email, tripId } = createInviteDto;
    this.logger.log(
      `Creating invite for ${email} to trip ${tripId} from user ${senderUserId}`,
    );

    try {
      const tripName = 'Sample Trip Name';

      const existingInvite = await this.inviteModel
        .findOne({
          email: email.toLowerCase(),
          tripId: tripId,
          accepted: false,
        })
        .exec();

      if (existingInvite) {
        throw new ConflictException(
          `An invitation for ${email} to this trip is already pending.`,
        );
      }

      const senderName = 'A BirdPlan User';

      const newInvite = new this.inviteModel({
        email: email.toLowerCase(),
        tripId: tripId,
        ownerId: senderUserId,
        accepted: false,
      });
      await newInvite.save();
      this.logger.log(`Invite record created with ID: ${newInvite._id}`);

      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:3000',
      );
      const acceptUrl = `${frontendUrl}/accept-invite?inviteId=${newInvite._id}`;

      await this.emailService.sendInviteEmail({
        email: email,
        fromName: senderName,
        tripName: tripName,
        url: acceptUrl,
      });

      this.logger.log(`Invite email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to create or send invite for ${email} to trip ${tripId}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process invitation.');
    }
  }

  async deleteManyByTrip(
    tripId: string,
    session?: ClientSession,
  ): Promise<{ deletedCount?: number }> {
    this.logger.log(`Deleting all invites for tripId: ${tripId}`);
    try {
      const result = await this.inviteModel
        .deleteMany({ tripId })
        .session(session ?? null)
        .exec();
      this.logger.log(
        `Deleted ${result.deletedCount} invites for tripId: ${tripId}`,
      );
      return { deletedCount: result.deletedCount };
    } catch (error) {
      this.logger.error(
        `Failed to delete invites for tripId ${tripId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Error deleting related invites');
    }
  }

  // Add other CRUD methods here later as needed (e.g., create, accept)
}
