import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

@Controller() // Use two distinct prefixes
@UseGuards(FirebaseGuard) // Apply guard to all routes
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('my-profile')
  getMyProfile(@Req() req: AuthenticatedRequest) {
    // The service handles creating the profile if it doesn't exist
    return this.accountService.getMyProfile(req.user.uid);
  }

  @Patch('my-profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMyProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.accountService.updateMyProfile(req.user.uid, updateProfileDto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Req() req: AuthenticatedRequest) {
    await this.accountService.deleteMyAccount(req.user.uid);
  }
}
