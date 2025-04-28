import {
  Controller,
  Get,
  Patch,
  Post, // For add-star
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { TargetsService } from './targets.service';
import {
  UpsertTargetListDto,
  SetTargetNotesDto,
  TargetStarDto,
} from './dto/target-list.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

@Controller('trips/:tripId') // Base route for trip-related targets
@UseGuards(FirebaseGuard) // Apply guard to all target operations
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  // --- Trip-level Targets ---
  @Get('targets')
  async getTripTargets(@Param('tripId') tripId: string) {
    const targets = await this.targetsService.findTargets(tripId);
    // Original API returned null if not found, so we mimic that
    if (!targets) {
      return null;
    }
    return targets;
  }

  @Patch('targets')
  async upsertTripTargets(
    @Param('tripId') tripId: string,
    @Body() upsertDto: UpsertTargetListDto,
  ) {
    // We assume findTripAndCheckAuth happens implicitly via the guard on the service calls for upsert
    // Or add specific checks if needed
    return this.targetsService.upsertTargets(tripId, upsertDto);
  }

  // --- Hotspot-level Targets ---
  @Get('hotspots/:hotspotId/targets')
  async getHotspotTargets(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
  ) {
    const targets = await this.targetsService.findTargets(tripId, hotspotId);
    if (!targets) {
      return null;
    }
    return targets;
  }

  @Patch('hotspots/:hotspotId/targets')
  async upsertHotspotTargets(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() upsertDto: UpsertTargetListDto,
  ) {
    // Ensure hotspotId from body matches param if necessary, or rely on service logic
    if (upsertDto.hotspotId && upsertDto.hotspotId !== hotspotId) {
      // Potentially throw a BadRequestException
    }
    return this.targetsService.upsertTargets(tripId, upsertDto, hotspotId);
  }

  // --- Target Notes & Stars (Operate on Trip) ---
  @Patch('targets/notes') // Using PATCH as it modifies the trip
  @HttpCode(HttpStatus.NO_CONTENT)
  async setTargetNotes(
    @Param('tripId') tripId: string,
    @Body() notesDto: SetTargetNotesDto,
    // @Req() req: AuthenticatedRequest // Auth already handled by controller guard
  ) {
    await this.targetsService.setTargetNotes(tripId, notesDto);
  }

  @Post('targets/stars') // POST to add star
  @HttpCode(HttpStatus.NO_CONTENT)
  async addTargetStar(
    @Param('tripId') tripId: string,
    @Body() starDto: TargetStarDto,
  ) {
    await this.targetsService.addTargetStar(tripId, starDto);
  }

  @Delete('targets/stars') // DELETE to remove star (more conventional than PATCH here)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTargetStar(
    @Param('tripId') tripId: string,
    @Body() starDto: TargetStarDto, // Send code in body for DELETE
  ) {
    await this.targetsService.removeTargetStar(tripId, starDto);
  }
}
