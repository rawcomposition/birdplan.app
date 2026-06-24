import type { IntegrationToken } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<IntegrationToken, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId(32) },
  tripId: { type: String, required: true },
  type: { type: String, required: true, enum: ["openbirding"] },
  lastUsedAt: { type: Date, default: null },
};

const IntegrationTokenSchema = new Schema(fields, {
  timestamps: true,
});

IntegrationTokenSchema.index({ tripId: 1, createdAt: -1 });

const IntegrationTokenModel =
  (mongoose.models.IntegrationToken as Model<IntegrationToken>) ||
  model<IntegrationToken>("IntegrationToken", IntegrationTokenSchema);

export default IntegrationTokenModel;
