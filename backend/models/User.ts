import type { User } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<User, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
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

const UserSchema = new Schema(fields, {
  timestamps: true,
});

UserSchema.index({ email: 1 }, { unique: true });

const UserModel = (mongoose.models.User as Model<User>) || model<User>("User", UserSchema);

export default UserModel;
