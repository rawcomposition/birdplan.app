import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HotspotsService } from './hotspots.service';
import { HotspotDto, HotspotFavDto } from './dto/hotspot.dto';
import { UpdateHotspotNotesDto } from './dto/update-hotspot-notes.dto';
import { RemoveHotspotFavDto } from './dto/remove-hotspot-fav.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

@Controller('trips/:tripId/hotspots') // Nested route
@UseGuards(FirebaseGuard) // Apply guard to all routes in this controller
export class HotspotsController {
  constructor(private readonly hotspotsService: HotspotsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT) // Or CREATED (201) if you return the created object
  async addHotspot(
    @Param('tripId') tripId: string,
    @Body() hotspotDto: HotspotDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Service handles conflict check and returns void/throws
    await this.hotspotsService.addHotspot(tripId, hotspotDto, req.user.uid);
    // Return nothing for 204
  }

  @Delete(':hotspotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeHotspot(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.hotspotsService.removeHotspot(tripId, hotspotId, req.user.uid);
    // Return nothing for 204
  }

  @Patch(':hotspotId/notes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNotes(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() updateNotesDto: UpdateHotspotNotesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.hotspotsService.updateNotes(
      tripId,
      hotspotId,
      updateNotesDto,
      req.user.uid,
    );
  }

  @Post(':hotspotId/favs')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addSpeciesFav(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() favDto: HotspotFavDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.hotspotsService.addSpeciesFav(
      tripId,
      hotspotId,
      favDto,
      req.user.uid,
    );
  }

  @Patch(':hotspotId/favs')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSpeciesFav(
    @Param('tripId') tripId: string,
    @Param('hotspotId') hotspotId: string,
    @Body() removeFavDto: RemoveHotspotFavDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.hotspotsService.removeSpeciesFav(
      tripId,
      hotspotId,
      removeFavDto,
      req.user.uid,
    );
  }

  // TODO: Add endpoints for other hotspot actions (targets, info, obs, translate, etc.)
}
