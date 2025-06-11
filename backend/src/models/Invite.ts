import type { Invite } from "shared/types.js";
import mongoose, { Schema, model, Model } from "mongoose";
import { nanoId } from "lib/utils.js";

const fields: Record<keyof Omit<Invite, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  email: { type: String, required: true },
  tripId: { type: String, required: true },
  ownerId: { type: String, required: true },
  accepted: { type: Boolean, required: true, default: false },
  name: String,
  uid: String,
};

const InviteSchema = new Schema(fields, {
  timestamps: true,
});

InviteSchema.index({ tripId: 1, createdAt: -1 }); // share modal
InviteSchema.index({ tripId: 1, uid: 1 }); // trip editors endpoint

const InviteModel = (mongoose.models.Invite as Model<Invite>) || model<Invite>("Invite", InviteSchema);

export default InviteModel;
