import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, tripToGeoJson, sanitizeFileName, nanoId } from "lib/utils.js";
import { connect, Trip, TargetList, Invite, Profile } from "lib/db.js";
import type { TripUpdateInput, Editor } from "@birdplan/shared";
import { TargetListType } from "@birdplan/shared";
import targets from "./targets.js";
import markers from "./markers.js";
import hotspots from "./hotspots.js";
import itinerary from "./itinerary.js";
// @ts-ignore - no type definitions available
import tokml from "@maphubs/tokml";

const trip = new Hono();

trip.route("/targets", targets);
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

  if (hasChangedDates) {
    await Promise.all([
      Trip.updateOne(
        { _id: tripId },
        { ...newData, hotspots: trip.hotspots?.map(({ targetsId, ...hotspot }) => hotspot) || [] }
      ),
      TargetList.deleteMany({ tripId, type: TargetListType.hotspot }),
    ]);
  } else {
    await Trip.updateOne({ _id: tripId }, newData);
  }

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

  await Promise.all([
    Trip.deleteOne({ _id: tripId }),
    TargetList.deleteMany({ tripId }),
    Invite.deleteMany({ tripId }),
  ]);

  return c.json({});
});

trip.get("/all-hotspot-targets", async (c) => {
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, results] = await Promise.all([
    Trip.findById(tripId),
    TargetList.find({ type: TargetListType.hotspot, tripId }).sort({ createdAt: -1 }),
  ]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  return c.json(results);
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
  const [trip, hotspotTargets, profile] = await Promise.all([
    Trip.findById(tripId).lean(),
    TargetList.find({ tripId, type: TargetListType.hotspot }).lean(),
    Profile.findOne({ uid }).lean(),
  ]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  const lifelist = profile?.lifelist || [];

  const filteredTargets = hotspotTargets.map((target) => {
    const needs = target.items?.filter((it) => !lifelist?.includes(it.code));
    const filtered = needs?.filter((it) => it.percentYr >= 5);
    const items = filtered?.sort((a, b) => b.percentYr - a.percentYr);
    return { ...target, items };
  });

  const geoJson = tripToGeoJson(trip, filteredTargets);
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

function daysBetweenInclusive(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

trip.patch("/set-date-range", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  const body = await c.req.json<{ startDate: string; endDate: string }>();
  const { startDate, endDate } = body;

  if (!startDate || !endDate) {
    throw new HTTPException(400, { message: "Start date and end date are required" });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    throw new HTTPException(400, { message: "End date cannot be before start date" });
  }

  const N = daysBetweenInclusive(startDate, endDate);
  if (N < 1) {
    throw new HTTPException(400, { message: "Invalid date range" });
  }

  await connect();
  const tripDoc = await Trip.findById(tripId).lean();
  if (!tripDoc) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!tripDoc.userIds.includes(session.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const M = tripDoc.itinerary?.length ?? 0;

  if (N < M) {
    throw new HTTPException(400, {
      message:
        "End date would remove days that have content. Use a later end date or remove days from the itinerary first.",
    });
  }

  if (M === 0) {
    const newDays = Array.from({ length: N }, () => ({
      id: nanoId(6),
      locations: [],
    }));
    await Trip.updateOne({ _id: tripId }, { startDate, itinerary: newDays });
  } else {
    if (N > M) {
      const extraDays = Array.from({ length: N - M }, () => ({
        id: nanoId(6),
        locations: [],
      }));
      const updatedItinerary = [...(tripDoc.itinerary ?? []), ...extraDays];
      await Trip.updateOne({ _id: tripId }, { startDate, itinerary: updatedItinerary });
    } else {
      await Trip.updateOne({ _id: tripId }, { startDate });
    }
  }

  return c.json({});
});

export default trip;
