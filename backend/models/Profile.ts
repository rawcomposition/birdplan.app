import type { Profile } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Profile, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  uid: { type: String, required: true, unique: true },
  name: String,
  email: String,
  lifelist: { type: [String], default: [] },
  exceptions: { type: [String], default: [] },
  dismissedNoticeId: String,
  lastActiveAt: { type: Date, default: new Date() },
  resetToken: String,
  resetTokenExpires: Date,
  sessionId: String,
  sessionExpires: Date,
  verificationToken: String,
  verificationTokenExpires: Date,
};

const ProfileSchema = new Schema(fields, {
  timestamps: true,
});

const ProfileModel = (mongoose.models.Profile as Model<Profile>) || model<Profile>("Profile", ProfileSchema);

export default ProfileModel;
