import type { MagicLink } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<MagicLink, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  consumedAt: { type: Date, default: null },
  createdByUserId: { type: String },
};

const MagicLinkSchema = new Schema(fields, {
  timestamps: true,
});

MagicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MagicLinkModel = (mongoose.models.MagicLink as Model<MagicLink>) || model<MagicLink>("MagicLink", MagicLinkSchema);

export default MagicLinkModel;
