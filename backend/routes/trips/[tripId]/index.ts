import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  authenticate,
  authenticateOptional,
  tripToGeoJson,
  sanitizeFileName,
  getMonthRange,
  computeFrequency,
  generateOpenBirdingCode,
  getBounds,
} from "lib/utils.js";
import { connect, Trip, Invite, Participant, Profile, TripShareToken } from "lib/db.js";
import { isTripEditor, isEditorInRoster, loadActiveRoster, loadProfilesByUid, resolveTripLifelist } from "lib/participants.js";
import { uploadMapboxImageToStorage } from "lib/firebaseAdmin.js";
import { OPENBIRDING_API_URL, SHARE_CODE_TTL_MINUTES } from "lib/config.js";
import type { TripUpdateInput, OpenBirdingLocationResponse } from "@birdplan/shared";
import targetStars from "./targets.js";
import markers from "./markers.js";
import hotspots from "./hotspots.js";
import itinerary from "./itinerary.js";
import participants from "./participants.js";
// @ts-ignore - no type definitions available
import tokml from "@maphubs/tokml";

const trip = new Hono();

trip.route("/targets", targetStars);
trip.route("/markers", markers);
trip.route("/hotspots", hotspots);
trip.route("/itinerary", itinerary);
trip.route("/participants", participants);

trip.get("/", async (c) => {
  const session = await authenticateOptional(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, roster] = await Promise.all([Trip.findById(tripId).lean(), loadActiveRoster(tripId)]);
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  if (!trip.isPublic && !isEditorInRoster(roster, session?.uid)) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const profilesByUid = await loadProfilesByUid(roster);
  const resolved = resolveTripLifelist(roster, profilesByUid, session?.uid);
  const { shareCode, shareCodeCreatedAt, ...tripData } = trip;
  return c.json({
    ...tripData,
    groupLifelist: resolved.groupLifelist,
    groupLifelistUpdatedAt: resolved.groupUpdatedAt,
    isGroupTrip: resolved.isGroup,
    viewerLifelist: resolved.viewerLifelist,
    viewer: resolved.viewer,
  });
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
  if (!(await isTripEditor(tripId, session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const data = await c.req.json<TripUpdateInput>();

  const newData: Record<string, any> = {
    name: data.name,
    region: data.region,
    startMonth: data.startMonth,
    endMonth: data.endMonth,
  };

  if (data.region !== trip.region) {
    const bounds = await getBounds(data.region);
    if (!bounds) {
      throw new HTTPException(500, { message: "Failed to fetch region info" });
    }
    const mapboxImgUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/[${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY}]/300x185@2x?access_token=${process.env.MAPBOX_SERVER_KEY}&padding=30`;
    const imgUrl = await uploadMapboxImageToStorage(mapboxImgUrl);
    newData.bounds = bounds;
    newData.imgUrl = imgUrl;
  }

  await Trip.updateOne({ _id: tripId }, newData);

  return c.json({});
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
    Participant.deleteMany({ tripId }),
    Invite.deleteMany({ tripId }),
    TripShareToken.deleteMany({ tripId }),
  ]);

  return c.json({});
});

trip.get("/export", async (c) => {
  const tripId: string | undefined = c.req.param("tripId");
  const uid: string | undefined = c.req.query("uid");
  const targets: string | undefined = c.req.query("targets");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const [trip, roster] = await Promise.all([Trip.findById(tripId).lean(), loadActiveRoster(tripId)]);

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  const profilesByUid = await loadProfilesByUid(roster);
  const resolved = resolveTripLifelist(roster, profilesByUid, uid);
  const lifelist =
    (targets === "personal" ? resolved.viewerLifelist : null) ??
    resolved.groupLifelist ??
    resolved.viewerLifelist ??
    (uid ? (await Profile.findOne({ uid }).lean())?.lifelist : null) ??
    [];
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

    const succeeded = results.filter((r) => r.data !== null);
    if (succeeded.length === 0 && results.length > 0) {
      throw new HTTPException(502, { message: "Failed to fetch target data from OpenBirding" });
    }

    for (const { id, data } of succeeded) {
      const items = data!.items
        .map((item) => ({
          name: item.name,
          code: item.code,
          frequency: computeFrequency(item.obs, data!.samples, months),
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

trip.post("/share-code", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");

  if (!tripId) {
    throw new HTTPException(400, { message: "Trip ID is required" });
  }

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) {
    throw new HTTPException(404, { message: "Trip not found" });
  }
  if (!(await isTripEditor(tripId, session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  const isExpired =
    !existing.shareCode ||
    !existing.shareCodeCreatedAt ||
    Date.now() - new Date(existing.shareCodeCreatedAt).getTime() > SHARE_CODE_TTL_MINUTES * 60 * 1000;

  if (!isExpired) {
    const expiresAt = new Date(new Date(existing.shareCodeCreatedAt!).getTime() + SHARE_CODE_TTL_MINUTES * 60 * 1000);
    return c.json({ shareCode: existing.shareCode, expiresAt: expiresAt.toISOString() });
  }

  const maxRetries = 5;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const code = generateOpenBirdingCode();
      const now = new Date();
      const updated = await Trip.findOneAndUpdate(
        { _id: tripId },
        { $set: { shareCode: code, shareCodeCreatedAt: now } },
        { returnDocument: "after" }
      );
      const savedCode = updated!.shareCode!;
      const savedAt = new Date(updated!.shareCodeCreatedAt!).getTime();
      const expiresAt = new Date(savedAt + SHARE_CODE_TTL_MINUTES * 60 * 1000);
      return c.json({ shareCode: savedCode, expiresAt: expiresAt.toISOString() });
    } catch (error: any) {
      const isDuplicateCode = error?.code === 11000 && error?.keyPattern?.shareCode;
      if (!isDuplicateCode || attempt === maxRetries - 1) throw error;
    }
  }

  throw new HTTPException(500, { message: "Failed to generate share code" });
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
  if (!(await isTripEditor(tripId, session.uid))) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  await Trip.updateOne({ _id: tripId }, { startDate });

  return c.json({});
});

export default trip;
