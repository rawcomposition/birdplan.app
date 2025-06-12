import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate, tripToGeoJson, sanitizeFileName } from "lib/utils.js";
import { connect, Trip, TargetList, Invite, Profile } from "lib/db.js";
import type { TripUpdateInput, Editor } from "shared/types.js";
import { TargetListType } from "shared/enums.js";
// @ts-ignore
import * as tokml from "@maphubs/tokml";

const trip = new Hono();

trip.get("/", async (c) => {
  const session = await authenticate(c);
  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
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

  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
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
        { _id: id },
        { ...newData, hotspots: trip.hotspots?.map(({ targetsId, ...hotspot }) => hotspot) || [] }
      ),
      TargetList.deleteMany({ tripId: id, type: TargetListType.hotspot }),
    ]);
  } else {
    await Trip.updateOne({ _id: id }, newData);
  }

  return c.json({ hasChangedDates });
});

trip.delete("/", async (c) => {
  const session = await authenticate(c);

  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (trip.ownerId !== session.uid) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Promise.all([
    Trip.deleteOne({ _id: id }),
    TargetList.deleteMany({ tripId: id }),
    Invite.deleteMany({ tripId: id }),
  ]);

  return c.json({});
});

trip.get("/all-hotspot-targets", async (c) => {
  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, results] = await Promise.all([
    Trip.findById(id),
    TargetList.find({ type: TargetListType.hotspot, tripId: id }).sort({ createdAt: -1 }),
  ]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  return c.json(results);
});

trip.get("/editors", async (c) => {
  const session = await authenticate(c);
  const id: string | undefined = c.req.param("id");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const trip = await Trip.findById(id);

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
  const id: string | undefined = c.req.param("id");
  const uid: string | undefined = c.req.query("uid");

  if (!id) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, hotspotTargets, profile] = await Promise.all([
    Trip.findById(id).lean(),
    TargetList.find({ tripId: id, type: TargetListType.hotspot }).lean(),
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

export default trip;
