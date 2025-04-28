import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from '../trips/entities/trip.entity'; // Need Trip schema
import { TargetsModule } from '../targets/targets.module'; // Need TargetsService
import { HotspotsService } from './hotspots.service';
import { HotspotsController } from './hotspots.controller'; // Import Controller

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]), // Import Trip model
    TargetsModule, // Import TargetsModule to use TargetsService
  ],
  controllers: [HotspotsController], // Add Controller
  providers: [HotspotsService],
  exports: [HotspotsService], // Export if needed
})
export class HotspotsModule {}
