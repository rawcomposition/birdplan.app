import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Profile, ProfileSchema } from './entities/profile.entity';
import { Trip, TripSchema } from '../trips/entities/trip.entity';
import {
  TargetList,
  TargetListSchema,
} from '../targets/entities/target-list.entity';
import { Invite, InviteSchema } from '../invites/entities/invite.entity';
import { AuthModule } from '../auth/auth.module'; // Needed for AuthService injection
import { EbirdModule } from '../external/ebird/ebird.module'; // Import EbirdModule
// TODO: Import EbirdModule when implemented

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: Trip.name, schema: TripSchema },
      { name: TargetList.name, schema: TargetListSchema },
      { name: Invite.name, schema: InviteSchema },
    ]),
    AuthModule, // Import AuthModule because AccountService depends on AuthService
    EbirdModule, // Add EbirdModule here as EbirdService is injected into AccountService
    // TODO: EbirdModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
