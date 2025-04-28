import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InviteDocument = Invite & Document;

@Schema({ timestamps: true, _id: false }) // Disable Mongoose default _id, use custom
export class Invite {
  @Prop({ type: String, default: () => require('nanoid').nanoid() })
  _id: string;

  @Prop({ required: true }) email: string;
  @Prop({ required: true, index: true }) tripId: string;
  @Prop({ required: true }) ownerId: string;
  @Prop({ required: true, default: false }) accepted: boolean;
  @Prop() name?: string;
  @Prop({ index: true }) uid?: string; // User ID of the accepted invitee
}

export const InviteSchema = SchemaFactory.createForClass(Invite);

// Define compound indexes
InviteSchema.index({ tripId: 1, createdAt: -1 });
InviteSchema.index({ tripId: 1, uid: 1 });
