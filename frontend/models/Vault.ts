import { Vault } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

const fields: Record<keyof Omit<Vault, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  key: { type: String, required: true },
  value: { type: String, required: true },
};

const VaultSchema = new Schema(fields, {
  timestamps: true,
});

const VaultModel = (models.Vault as Model<Vault>) || model<Vault>("Vault", VaultSchema);

export default VaultModel;
