import type { Profile } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Profile, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  uid: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, lowercase: true },
  photoUrl: String,
  lifelist: { type: [String], default: [] },
  lifelistUpdatedAt: { type: Date, default: null },
  exceptions: { type: [String], default: [] },
  dismissedNoticeId: String,
  lastActiveAt: { type: Date, default: new Date() },
  lastAuthenticatedAt: { type: Date, default: null },
  isAdmin: { type: Boolean, default: false },
};

const ProfileSchema = new Schema(fields, {
  timestamps: true,
});

ProfileSchema.index({ email: 1 }, { unique: true });

const ProfileModel = (mongoose.models.Profile as Model<Profile>) || model<Profile>("Profile", ProfileSchema);

export default ProfileModel;
