import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, tripToGeoJson, sanitizeFileName, getMonthRange, computeFrequency } from "lib/utils.js";
import { connect, Trip, Invite, Profile } from "lib/db.js";
import { OPENBIRDING_API_URL } from "lib/config.js";
import type { TripUpdateInput, Editor, OpenBirdingLocationResponse } from "@birdplan/shared";
import targetStars from "./targets.js";
import markers from "./markers.js";
import hotspots from "./hotspots.js";
import itinerary from "./itinerary.js";
// @ts-ignore - no type definitions available
import tokml from "@maphubs/tokml";

const trip = new Hono();

trip.route("/targets", targetStars);
trip.route("/markers", markers);
trip.route("/hotspots", hotspots);
trip.route("/itinerary", itinerary);

trip.get("/", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  return c.json(trip);
});

trip.patch("/", async (c) => {
  const session = await authenticate(c);

  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const data = await c.req.json<TripUpdateInput>();

  const hasChangedDates = data.startMonth !== trip.startMonth || data.endMonth !== trip.endMonth;
  const newData = { name: data.name, startMonth: data.startMonth, endMonth: data.endMonth };

  await Trip.updateOne({ _id: tripId }, newData);

  return c.json({ hasChangedDates });
});

trip.delete("/", async (c) => {
  const session = await authenticate(c);

  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (trip.ownerId !== session.uid) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Promise.all([Trip.deleteOne({ _id: tripId }), Invite.deleteMany({ tripId })]);

  return c.json({});
});

trip.get("/editors", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(tripId);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  if (trip.userIds.length === 0) {
    return c.json([]);
  }

  const profiles = await Profile.find({ uid: { $in: trip.userIds } });

  const editors: Editor[] = profiles.map((profile) => ({
    uid: profile.uid!,
    name: profile?.name || `User ${profile.uid}`,
    lifelist: profile?.lifelist || [],
  }));

  return c.json(editors);
});

trip.get("/export", async (c) => {
  const tripId: string | undefined = c.req.param("tripId");
  const uid: string | undefined = c.req.query("uid");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, profile] = await Promise.all([Trip.findById(tripId).lean(), Profile.findOne({ uid }).lean()]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  const lifelist = profile?.lifelist || [];
  const months = getMonthRange(trip.startMonth, trip.endMonth);

  // Fetch targets from OpenBirding for each saved hotspot
  const hotspotTargets: Record<string, { name: string; frequency: number }[]> = {};
  if (OPENBIRDING_API_URL && trip.hotspots?.length) {
    const results = await Promise.all(
      trip.hotspots.map(async (hotspot) => {
        try {
          const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/targets/location/${hotspot.id}`);
          if (!res.ok) return { id: hotspot.id, data: null };
          const data: OpenBirdingLocationResponse = await res.json();
          return { id: hotspot.id, data };
        } catch {
          return { id: hotspot.id, data: null };
        }
      })
    );

    for (const { id, data } of results) {
      if (!data) continue;
      const items = data.items
        .map((item) => ({
          name: item.name,
          code: item.code,
          frequency: computeFrequency(item.obs, data.samples, months),
        }))
        .filter((it) => !lifelist.includes(it.code) && it.frequency >= 5)
        .sort((a, b) => b.frequency - a.frequency);
      hotspotTargets[id] = items;
    }
  }

  const geoJson = tripToGeoJson(trip, hotspotTargets);
  const kml = tokml(geoJson);

  return c.body(kml, 200, {
    "Content-Type": "application/vnd.google-earth.kml+xml",
    "Content-Disposition": `attachment; filename="${sanitizeFileName(trip.name)}.kml"`,
  });
});

trip.get("/invites", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, invites] = await Promise.all([
    Trip.findById(tripId),
    Invite.find({ tripId }, ["name", "email", "uid"]).sort({ createdAt: -1 }),
  ]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  return c.json(invites);
});

trip.patch("/set-start-date", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  const { startDate } = await c.req.json<{ startDate: string }>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!trip.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Trip.updateOne({ _id: tripId }, { startDate });

  return c.json({});
});

export default trip;
