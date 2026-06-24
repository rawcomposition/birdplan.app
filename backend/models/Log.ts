import type { Log } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Log, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  type: { type: String, required: true },
  email: { type: String, default: null },
  userId: { type: String, default: null },
  ip: { type: String, default: null },
  data: { type: Schema.Types.Mixed, default: null },
};

const LogSchema = new Schema(fields, {
  timestamps: true,
});

LogSchema.index({ type: 1, createdAt: -1 });
LogSchema.index({ createdAt: -1 });

const LogModel = (mongoose.models.Log as Model<Log>) || model<Log>("Log", LogSchema);

export default LogModel;
