import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define interface/class for nested structure
export class TargetListItem {
  @Prop() code: string;
  @Prop() name: string;
  @Prop() percent: number;
  @Prop() percentYr: number;
}

export type TargetListDocument = TargetList & Document;

@Schema({ timestamps: true, _id: false }) // Disable Mongoose default _id, use custom
export class TargetList {
  @Prop({ type: String, default: () => require('nanoid').nanoid() })
  _id: string;

  @Prop({ required: true, index: true }) type: string; // e.g., 'trip', 'hotspot'
  @Prop({ required: true, index: true }) tripId: string;
  @Prop({ index: true }) hotspotId?: string; // Optional, only for hotspot type targets

  @Prop({ type: [TargetListItem], _id: false, default: [] })
  items: TargetListItem[];

  @Prop({ required: true }) N: number;
  @Prop({ required: true }) yrN: number;
}

export const TargetListSchema = SchemaFactory.createForClass(TargetList);

// Define compound indexes
TargetListSchema.index({ tripId: 1, type: 1, createdAt: -1 });
TargetListSchema.index({ tripId: 1, type: 1, hotspotId: 1, createdAt: -1 });
