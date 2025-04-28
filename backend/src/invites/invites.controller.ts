import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
// import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard'; // Removed for now
import { Request } from 'express'; // Import Request

@Controller('invites')
// @UseGuards(FirebaseAuthGuard) // Removed for now
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createInvite(
    @Body(ValidationPipe) createInviteDto: CreateInviteDto,
    @Req() req: Request,
  ): Promise<void> {
    // Casting req to any to access user property - refine later with proper typing/guard
    const user = (req as any).user as { uid: string; name?: string };
    if (!user || !user.uid) {
      // Handle missing user info appropriately (e.g., throw UnauthorizedException)
      // This check should ideally be handled by the guard itself.
      throw new Error(
        'User information not found on request. Is authentication middleware active?',
      );
    }
    const senderUserId = user.uid;
    // const senderName = user.name || 'Someone'; // Get sender name if available for email

    await this.invitesService.createAndSendInvite(
      createInviteDto,
      senderUserId /*, senderName */,
    );
  }
}
