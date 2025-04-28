import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from '../trips/entities/trip.entity'; // Need Trip schema
import { MarkersService } from './markers.service';
import { MarkersController } from './markers.controller'; // Import Controller

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]), // Import Trip model
  ],
  controllers: [MarkersController], // Add Controller
  providers: [MarkersService],
  exports: [MarkersService], // Export if needed
})
export class MarkersModule {}
