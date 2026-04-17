import type { TripShareToken } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<TripShareToken, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId(32) },
  tripId: { type: String, required: true },
  type: { type: String, required: true, enum: ["openbirding"] },
  lastUsedAt: { type: Date, default: null },
};

const TripShareTokenSchema = new Schema(fields, {
  timestamps: true,
});

TripShareTokenSchema.index({ tripId: 1, createdAt: -1 });

const TripShareTokenModel =
  (mongoose.models.TripShareToken as Model<TripShareToken>) ||
  model<TripShareToken>("TripShareToken", TripShareTokenSchema);

export default TripShareTokenModel;
