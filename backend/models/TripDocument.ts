import type { TripDocument } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<TripDocument, "createdAt" | "updatedAt" | "url">, any> = {
  _id: { type: String, default: () => nanoId() },
  tripId: { type: String, required: true },
  name: { type: String, required: true },
  key: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  category: { type: String, default: null },
  visibility: { type: String, default: "trip" },
  uploadedBy: { type: String, required: true },
};

const TripDocumentSchema = new Schema(fields, {
  timestamps: true,
});

TripDocumentSchema.index({ tripId: 1, createdAt: 1 });

const TripDocumentModel =
  (mongoose.models.TripDocument as Model<TripDocument>) || model<TripDocument>("TripDocument", TripDocumentSchema);

export default TripDocumentModel;
