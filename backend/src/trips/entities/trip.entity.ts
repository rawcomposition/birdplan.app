import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// Define interfaces or classes for nested structures
export class Bounds {
  @Prop({ required: true }) minX: number;
  @Prop({ required: true }) maxX: number;
  @Prop({ required: true }) minY: number;
  @Prop({ required: true }) maxY: number;
}

export class Travel {
  @Prop() time?: number;
  @Prop() distance?: number;
  @Prop() method?: string;
  @Prop() locationId?: string;
  @Prop() isDeleted?: boolean;
}

export class ItineraryLocation {
  @Prop() id?: string;
  @Prop({ type: String }) type?: string; // Explicit type declaration
  @Prop() locationId?: string;
  @Prop({ type: Travel, _id: false }) travel?: Travel;
}

export class ItineraryItem {
  @Prop() id?: string;
  @Prop() notes?: string;
  @Prop({ type: [ItineraryLocation], _id: false, default: [] })
  locations?: ItineraryLocation[];
}

export class HotspotFav {
  @Prop() name?: string;
  @Prop() code?: string;
  @Prop() range?: string;
  @Prop() percent?: number;
}

export class Hotspot {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) name: string;
  @Prop() originalName?: string;
  @Prop({ required: true }) lat: number;
  @Prop({ required: true }) lng: number;
  @Prop() notes?: string;
  @Prop() species?: number;
  @Prop() targetsId?: string;
  @Prop({ type: [HotspotFav], _id: false, default: [] }) favs?: HotspotFav[];
}

export class Marker {
  @Prop({ required: true }) id: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) lat: number;
  @Prop({ required: true }) lng: number;
  @Prop() notes?: string;
  @Prop() icon?: string;
  @Prop() placeId?: string;
  @Prop() placeType?: string;
}

// Export the Trip document type
export type TripDocument = Trip & Document;

@Schema({ timestamps: true, _id: false }) // Disable Mongoose default _id, use custom
export class Trip {
  // Custom ID generator (using Prop with default factory is standard)
  @Prop({ type: String, default: () => require('nanoid').nanoid() }) // Assuming nanoid is installed or available
  _id: string;

  @Prop({ type: [String], required: true, index: true }) userIds: string[];
  @Prop({ required: true }) ownerId: string;
  @Prop() ownerName?: string;
  @Prop({ default: true }) isPublic: boolean;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) region: string;

  @Prop({ type: Bounds, required: true, _id: false }) bounds: Bounds;
  @Prop({ type: [ItineraryItem], _id: false, default: [] })
  itinerary?: ItineraryItem[];
  @Prop({ type: [Hotspot], _id: false, default: [] }) hotspots?: Hotspot[];
  @Prop({ type: [Marker], _id: false, default: [] }) markers?: Marker[];

  @Prop({ type: String, default: null }) startDate?: string;
  @Prop({ required: true }) startMonth: number;
  @Prop({ required: true }) endMonth: number;
  @Prop({ required: true }) timezone: string;
  @Prop({ type: String, default: null }) imgUrl?: string;

  @Prop({ type: [String], default: [] }) targetStars?: string[];
  @Prop({ type: MongooseSchema.Types.Map, of: String, default: {} })
  targetNotes?: Map<string, string>;
}

export const TripSchema = SchemaFactory.createForClass(Trip);

// Add compound indexes from the original schema if necessary
TripSchema.index({ userIds: 1, createdAt: -1 }); // Example based on original schema
