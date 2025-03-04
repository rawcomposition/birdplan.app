import { Trip } from "lib/types";
import { Schema, model, models, Document, Model } from "mongoose";
import { nanoId } from "lib/helpers";

type TripDocument = Omit<Trip, "_id"> & Document<null>;

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
          type: String,
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
  locations: [
    {
      _id: false,
      id: { type: String, required: true },
      type: { type: String, required: true },
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

const TripSchema = new Schema<TripDocument>(fields, {
  timestamps: true,
});

const TripModel = (models.Trip as Model<TripDocument>) || model<TripDocument>("Trip", TripSchema);

export default TripModel;
