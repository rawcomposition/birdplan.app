import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TargetList, TargetListSchema } from './entities/target-list.entity';
import { Trip, TripSchema } from '../trips/entities/trip.entity';
import { TargetsService } from './targets.service';
import { TargetsController } from './targets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TargetList.name, schema: TargetListSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
  ],
  controllers: [TargetsController],
  providers: [TargetsService],
  exports: [TargetsService], // Export service for injection elsewhere
})
export class TargetsModule {}
