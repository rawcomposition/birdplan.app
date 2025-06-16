import type { QuizImages } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<QuizImages, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  code: { type: String, required: true },
  ids: { type: [String], required: true },
  name: { type: String, required: true },
};

const QuizImagesSchema = new Schema(fields, {
  timestamps: true,
});

const QuizImagesModel =
  (mongoose.models.QuizImages as Model<QuizImages>) || model<QuizImages>("QuizImages", QuizImagesSchema);

export default QuizImagesModel;
