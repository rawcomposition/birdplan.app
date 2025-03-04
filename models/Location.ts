import { Location } from "lib/types";
import { Schema, model, models, Document, Model } from "mongoose";
import { nanoId } from "lib/helpers";

type LocationDocument = Omit<Location, "_id"> & Document<null>;

const fields: Record<keyof Omit<Location, "createdAt" | "updatedAt">, any> = {
  _id: { type: String, default: () => nanoId() },
  ebirdId: { type: String, required: true },
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
};

const LocationSchema = new Schema<LocationDocument>(fields, {
  timestamps: true,
});

const LocationModel =
  (models.Location as Model<LocationDocument>) || model<LocationDocument>("Location", LocationSchema);

export default LocationModel;
