import type { SavedHotspot } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<SavedHotspot, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  userId: { type: String, required: true },
  hotspotId: { type: String, required: true },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  species: Number,
  checklists: Number,
  notes: String,
  listIds: { type: [String], default: [] },
};

const SavedHotspotSchema = new Schema(fields, {
  timestamps: true,
});

SavedHotspotSchema.index({ userId: 1, hotspotId: 1 }, { unique: true });

const SavedHotspotModel =
  (mongoose.models.SavedHotspot as Model<SavedHotspot>) || model<SavedHotspot>("SavedHotspot", SavedHotspotSchema);

export default SavedHotspotModel;
