import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";
import { randomId } from "lib/helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const trips = await db.collection("trip").where("itinerary", ">", []).get();
    for (const trip of trips.docs) {
      console.log(trip.id);
      const tripData = trip.data();
      const itinerary = tripData.itinerary as any[];
      const newItinerary = itinerary.map((day: any) => {
        const locations = day.locations.map((location: any) => {
          return { ...location, id: randomId(6) };
        });
        return { ...day, locations };
      });
      //await trip.ref.update({ itinerary: newItinerary });
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
