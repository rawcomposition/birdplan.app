import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { FirebaseGuard } from '../auth/guards/firebase.guard';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthenticatedRequest extends Request {
  user: DecodedIdToken;
}

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @UseGuards(FirebaseGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createTripDto: CreateTripDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tripsService.create(createTripDto, req.user);
  }

  @Get()
  @UseGuards(FirebaseGuard)
  findAll(@Req() req: AuthenticatedRequest) {
    return this.tripsService.findAllByUser(req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req?: AuthenticatedRequest) {
    const userId = req?.user?.uid;
    return this.tripsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(FirebaseGuard)
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tripsService.update(id, updateTripDto, req.user.uid);
  }

  @Delete(':id')
  @UseGuards(FirebaseGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.tripsService.remove(id, req.user.uid);
  }
}
