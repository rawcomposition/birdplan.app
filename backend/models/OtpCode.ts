import type { OtpCode } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<OtpCode, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  email: { type: String, required: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  consumedAt: { type: Date, default: null },
  ip: String,
};

const OtpCodeSchema = new Schema(fields, {
  timestamps: true,
});

OtpCodeSchema.index({ email: 1, createdAt: -1 });
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpCodeModel = (mongoose.models.OtpCode as Model<OtpCode>) || model<OtpCode>("OtpCode", OtpCodeSchema);

export default OtpCodeModel;
