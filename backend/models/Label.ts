import type { Label } from "@birdplan/shared";
import { LABEL_COLORS } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Label, "createdAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, enum: LABEL_COLORS, required: true },
};

const LabelSchema = new Schema(fields, {
  timestamps: { createdAt: true, updatedAt: false },
});

LabelSchema.index({ userId: 1, createdAt: 1 });

const LabelModel = (mongoose.models.Label as Model<Label>) || model<Label>("Label", LabelSchema);

export default LabelModel;
