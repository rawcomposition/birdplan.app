import type { Session } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";

const fields: Record<keyof Omit<Session, "createdAt" | "updatedAt">, any> = {
  _id: { type: String },
  secretHash: { type: String, required: true },
  userId: { type: String, required: true },
  lastActiveAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  userAgent: String,
  ip: String,
};

const SessionSchema = new Schema(fields, {
  timestamps: true,
});

SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SessionModel = (mongoose.models.Session as Model<Session>) || model<Session>("Session", SessionSchema);

export default SessionModel;
