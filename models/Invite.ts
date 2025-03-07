import { Invite } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

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

InviteSchema.index({ tripId: 1, createdAt: -1 });

const InviteModel = (models.Invite as Model<Invite>) || model<Invite>("Invite", InviteSchema);

export default InviteModel;
