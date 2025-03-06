import { Trip } from "lib/types";
import { Schema, model, models, Model } from "mongoose";
import { nanoId } from "lib/helpers";

const fields: Record<keyof Omit<Trip, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  userIds: [{ type: String, required: true }], // Array of uids
  ownerId: { type: String, required: true },
  ownerName: { type: String, required: true },
  name: { type: String, required: true },
  region: { type: String, required: true },
  bounds: {
    minX: { type: Number, required: true },
    maxX: { type: Number, required: true },
    minY: { type: Number, required: true },
    maxY: { type: Number, required: true },
  },
  itinerary: [
    {
      _id: false,
      id: String,
      notes: String,
      locations: [
        {
          _id: false,
          id: String,
          type: { type: String }, // Explicit because "type" is a reserved word in Mongoose
          locationId: String,
          travel: {
            _id: false,
            time: Number,
            distance: Number,
            method: String,
            locationId: String,
            isDeleted: Boolean,
          },
        },
      ],
    },
  ],
  hotspots: [
    {
      _id: false,
      id: { type: String, required: true },
      name: { type: String, required: true },
      originalName: String,
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      notes: String,
      species: Number,
      targetsId: String,
      favs: [
        {
          _id: false,
          name: String,
          code: String,
          range: String,
          percent: Number,
        },
      ],
    },
  ],
  markers: [
    {
      _id: false,
      id: { type: String, required: true },
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      notes: String,
      icon: String,
      placeId: String,
      placeType: String,
    },
  ],
  startDate: { type: String, default: null },
  startMonth: { type: Number, required: true },
  endMonth: { type: Number, required: true },
  timezone: { type: String, required: true },
  imgUrl: { type: String, default: null },
  targetStars: [{ type: String, default: [] }],
  targetNotes: { type: Map, of: String, default: {} },
};

const TripSchema = new Schema(fields, {
  timestamps: true,
});

const TripModel = (models.Trip as Model<Trip>) || model<Trip>("Trip", TripSchema);

export default TripModel;
