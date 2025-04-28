import { QuizImages } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

const fields: Record<keyof Omit<QuizImages, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  code: { type: String, required: true },
  ids: { type: [String], required: true },
  name: { type: String, required: true },
};

const QuizImagesSchema = new Schema(fields, {
  timestamps: true,
});

const QuizImagesModel = (models.QuizImages as Model<QuizImages>) || model<QuizImages>("QuizImages", QuizImagesSchema);

export default QuizImagesModel;
