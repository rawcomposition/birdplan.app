import type { HotspotList } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<HotspotList, "createdAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  userId: { type: String, required: true },
  name: { type: String, required: true },
};

const HotspotListSchema = new Schema(fields, {
  timestamps: { createdAt: true, updatedAt: false },
});

HotspotListSchema.index({ userId: 1, createdAt: 1 });

const HotspotListModel =
  (mongoose.models.HotspotList as Model<HotspotList>) || model<HotspotList>("HotspotList", HotspotListSchema);

export default HotspotListModel;
