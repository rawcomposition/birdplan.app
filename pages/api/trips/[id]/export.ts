import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "lib/firebaseAdmin";
import { Targets, Trip } from "lib/types";
import { tripToGeoJson } from "lib/helpers";
// @ts-ignore
import * as tokml from "@maphubs/tokml";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const id = req.query.id as string;
    const profileId = req.query.profileId as string;

    // Get trip
    const trip = await db.collection("trip").doc(id).get();
    const tripData = trip.data() as Trip;
    if (!tripData) throw new Error("Trip not found");

    // Get targets
    const targets = await db.collection("targets").where("tripId", "==", id).get();
    const targetsData = targets.docs.map((doc) => ({ ...(doc.data() as Targets), id: doc.id })) as Targets[];

    // Get lifelist
    let lifelist: string[] = [];
    if (profileId) {
      const profile = await db.collection("profile").doc(profileId).get();
      const profileData = profile.data();
      lifelist = profileData?.lifelist || [];
    }

    // Filter targets
    const filteredTargets = targetsData.map((target) => {
      const needs = target.items.filter((it) => !lifelist?.includes(it.code));
      const filtered = needs.filter((it) => it.percentYr >= 5);
      const items = filtered.sort((a, b) => b.percentYr - a.percentYr);
      return { ...target, items };
    });

    const geoJson = tripToGeoJson(tripData, filteredTargets);
    const kml = tokml(geoJson);

    res.setHeader("Content-Type", "application/vnd.google-earth.kml+xml");
    res.setHeader("Content-Disposition", `attachment; filename=Trip Data.kml`);
    res.status(200).send(kml);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
