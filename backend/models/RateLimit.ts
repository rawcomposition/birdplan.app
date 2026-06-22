import type { RateLimit } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";

const fields: Record<keyof Omit<RateLimit, "_id" | "createdAt" | "updatedAt">, any> = {
  action: { type: String, required: true },
  scopeType: { type: String, required: true },
  scopeValue: { type: String, required: true },
  windowMs: { type: Number, required: true },
  count: { type: Number, default: 0 },
  windowStartAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
};

const RateLimitSchema = new Schema(fields, {
  timestamps: true,
});

RateLimitSchema.index({ action: 1, scopeType: 1, scopeValue: 1, windowMs: 1 }, { unique: true });
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimitModel = (mongoose.models.RateLimit as Model<RateLimit>) || model<RateLimit>("RateLimit", RateLimitSchema);

export default RateLimitModel;
