import type { Participant } from "@birdplan/shared";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Participant, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  tripId: { type: String, required: true },
  status: { type: String, required: true, default: "active" },
  uid: String,
  email: String,
  name: String,
  listMode: { type: String, required: true, default: "world" },
  lifelist: { type: [String], default: [] },
  lifelistUpdatedAt: { type: Date, default: null },
  isOwner: { type: Boolean, required: true, default: false },
};

const ParticipantSchema = new Schema(fields, {
  timestamps: true,
});

ParticipantSchema.index({ tripId: 1, createdAt: 1 });
ParticipantSchema.index({ uid: 1 });
ParticipantSchema.index({ tripId: 1, uid: 1 }, { unique: true, partialFilterExpression: { uid: { $exists: true } } });
ParticipantSchema.index({ tripId: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } });

const ParticipantModel =
  (mongoose.models.Participant as Model<Participant>) || model<Participant>("Participant", ParticipantSchema);

export default ParticipantModel;
