import { TargetList } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

const fields: Record<keyof Omit<TargetList, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  type: { type: String, required: true },
  tripId: { type: String, required: true },
  hotspotId: String,
  items: [
    {
      _id: false,
      code: String,
      name: String,
      percent: Number,
      percentYr: Number,
    },
  ],
  N: { type: Number, required: true },
  yrN: { type: Number, required: true },
};

const TargetListSchema = new Schema(fields, {
  timestamps: true,
});

TargetListSchema.index({ tripId: 1, type: 1, createdAt: -1 });
TargetListSchema.index({ tripId: 1, type: 1, hotspotId: 1, createdAt: -1 });

const TargetListModel = (models.TargetList as Model<TargetList>) || model<TargetList>("TargetList", TargetListSchema);

export default TargetListModel;
