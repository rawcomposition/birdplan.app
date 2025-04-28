import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './entities/invite.entity';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
    EmailModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService], // Export service for injection elsewhere
})
export class InvitesModule {}
