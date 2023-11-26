import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";
import { Trip } from "lib/types";
import { tripToGeoJson } from "lib/helpers";
// @ts-ignore
import * as tokml from "@maphubs/tokml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const id = req.query.id as string;

    const trip = await db.collection("trip").doc(id).get();
    const tripData = trip.data() as Trip;
    if (!tripData) throw new Error("Trip not found");

    const geoJson = tripToGeoJson(tripData);

    const kml = tokml(geoJson);

    res.setHeader("Content-Type", "application/vnd.google-earth.kml+xml");
    res.setHeader("Content-Disposition", `attachment; filename=${tripData.name}.kml`);
    res.status(200).send(kml);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
