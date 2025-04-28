import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true, _id: false }) // Disable Mongoose default _id
export class Profile {
  @Prop({ type: String, default: () => require('nanoid').nanoid() })
  _id: string;

  @Prop({ required: true, unique: true, index: true })
  uid: string; // Firebase UID

  @Prop()
  name?: string;

  @Prop()
  email?: string;

  @Prop({ type: [String], default: [] })
  lifelist?: string[]; // speciesCodes

  @Prop({ type: [String], default: [] })
  exceptions?: string[]; // speciesCodes

  @Prop()
  dismissedNoticeId?: string;

  @Prop({ type: Date, default: Date.now })
  lastActiveAt?: Date;

  // Fields for password reset (might move to separate flow later)
  @Prop()
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
