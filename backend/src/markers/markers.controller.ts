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
import { MarkersService } from './markers.service';
import { MarkerDto } from './dto/marker.dto';
import { UpdateMarkerNotesDto } from './dto/update-marker-notes.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

@Controller('trips/:tripId/markers') // Nested route
@UseGuards(FirebaseGuard) // Apply guard to all routes
export class MarkersController {
  constructor(private readonly markersService: MarkersService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async addMarker(
    @Param('tripId') tripId: string,
    @Body() markerDto: MarkerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.markersService.addMarker(tripId, markerDto, req.user.uid);
  }

  @Delete(':markerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMarker(
    @Param('tripId') tripId: string,
    @Param('markerId') markerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.markersService.removeMarker(tripId, markerId, req.user.uid);
  }

  @Patch(':markerId/notes')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateNotes(
    @Param('tripId') tripId: string,
    @Param('markerId') markerId: string,
    @Body() updateNotesDto: UpdateMarkerNotesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.markersService.updateNotes(
      tripId,
      markerId,
      updateNotesDto,
      req.user.uid,
    );
  }
}
