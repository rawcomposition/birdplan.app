import type { HiddenHotspot } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<HiddenHotspot, "createdAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  userId: { type: String, required: true },
  hotspotId: { type: String, required: true },
};

const HiddenHotspotSchema = new Schema(fields, {
  timestamps: { createdAt: true, updatedAt: false },
});

HiddenHotspotSchema.index({ userId: 1, hotspotId: 1 }, { unique: true });

const HiddenHotspotModel =
  (mongoose.models.HiddenHotspot as Model<HiddenHotspot>) || model<HiddenHotspot>("HiddenHotspot", HiddenHotspotSchema);

export default HiddenHotspotModel;
