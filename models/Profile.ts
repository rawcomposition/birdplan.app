import { Profile } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

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
};

const ProfileSchema = new Schema(fields, {
  timestamps: true,
});

const ProfileModel = (models.Profile as Model<Profile>) || model<Profile>("Profile", ProfileSchema);

export default ProfileModel;
