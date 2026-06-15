import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  authenticate,
  tripToGeoJson,
  sanitizeFileName,
  getMonthRange,
  computeFrequency,
  generateOpenBirdingCode,
  getBounds,
} from "lib/utils.js";
import { connect, Trip, Invite, Profile, TripShareToken } from "lib/db.js";
import { sciNamesToCodes } from "lib/taxonomy.js";
import { uploadMapboxImageToStorage } from "lib/firebaseAdmin.js";
import { OPENBIRDING_API_URL, SHARE_CODE_TTL_MINUTES } from "lib/config.js";
import type {
  TripUpdateInput,
  Editor,
  OpenBirdingLocationResponse,
  LifelistImportInput,
  AddToLifelistInput,
  AddIntersectionListInput,
  UpdateIntersectionListInput,
  RenameIntersectionListInput,
  IntersectionList,
} from "@birdplan/shared";
import targetStars from "./targets.js";
import markers from "./markers.js";
import hotspots from "./hotspots.js";
import itinerary from "./itinerary.js";
// @ts-ignore - no type definitions available
import tokml from "@maphubs/tokml";

const trip = new Hono();

// The intersection of every source list's codes: a species counts as "seen" by the
// group only when it appears in all of them. Empty input ⇒ empty list.
function computeIntersection(lists: { codes: string[] }[]): string[] {
  if (lists.length === 0) return [];
  const [first, ...rest] = lists;
  let result = first.codes.filter((code, i) => first.codes.indexOf(code) === i);
  for (const list of rest) {
    const set = new Set(list.codes);
    result = result.filter((code) => set.has(code));
  }
  return result;
}

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

  const { shareCode, shareCodeCreatedAt, ...tripData } = trip;
  return c.json(tripData);
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
    Invite.deleteMany({ tripId }),
    TripShareToken.deleteMany({ tripId }),
  ]);

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

  const profiles = await Profile.find({ uid: { $in: trip.userIds } }).lean();

  const editors: Editor[] = profiles.map((profile) => ({
    uid: profile.uid!,
    name: profile?.name || `User ${profile.uid}`,
    lifelist: profile.lifelist || [],
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
  const trip = await Trip.findById(tripId).lean();

  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  const profile = await Profile.findOne({ uid }).lean();
  const lifelist = trip.customLifelist ?? profile?.lifelist ?? [];
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

// Import (replace) this trip's custom life list from a list of scientific names.
trip.put("/lifelist", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const { sciNames } = await c.req.json<LifelistImportInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);

  // Setting a single custom list puts the trip in single-custom mode, clearing any shared lists.
  await Trip.updateOne(
    { _id: tripId },
    { $set: { customLifelist: codes, customLifelistUpdatedAt: new Date(), intersectionLists: [] } }
  );

  return c.json({});
});

// Revert this trip to the owner's global life list (clears both single-custom and shared state).
trip.delete("/lifelist", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne(
    { _id: tripId },
    { $set: { customLifelist: null, customLifelistUpdatedAt: null, intersectionLists: [] } }
  );

  return c.json({});
});

// Add a named source list to this trip's intersection ("shared") life list. Switches the
// trip into shared mode, discarding any single-custom list (customLifelist is recomputed).
trip.post("/lifelist/intersection/lists", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const { name, sciNames } = await c.req.json<AddIntersectionListInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);
  const now = new Date();
  const newList = { name: name?.trim() || "Untitled list", codes, updatedAt: now };
  const lists = [...(existing.intersectionLists || []), newList];

  await Trip.updateOne(
    { _id: tripId },
    {
      $push: { intersectionLists: newList },
      $set: { customLifelist: computeIntersection(lists), customLifelistUpdatedAt: now },
    }
  );

  return c.json({});
});

// Replace one source list's species (a re-upload), then recompute the intersection.
trip.put("/lifelist/intersection/lists/:listId", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  const listId: string | undefined = c.req.param("listId");
  if (!tripId || !listId) throw new HTTPException(400, { message: "Trip ID and list ID are required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const { sciNames } = await c.req.json<UpdateIntersectionListInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);
  const now = new Date();
  const lists = (existing.intersectionLists || []).map((l: IntersectionList) =>
    String(l._id) === listId ? { ...l, codes, updatedAt: now } : l
  );

  await Trip.updateOne(
    { _id: tripId, "intersectionLists._id": listId },
    {
      $set: {
        "intersectionLists.$.codes": codes,
        "intersectionLists.$.updatedAt": now,
        customLifelist: computeIntersection(lists),
        customLifelistUpdatedAt: now,
      },
    }
  );

  return c.json({});
});

// Rename one source list.
trip.patch("/lifelist/intersection/lists/:listId", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  const listId: string | undefined = c.req.param("listId");
  if (!tripId || !listId) throw new HTTPException(400, { message: "Trip ID and list ID are required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const { name } = await c.req.json<RenameIntersectionListInput>();
  if (!name?.trim()) throw new HTTPException(400, { message: "Missing name" });

  await Trip.updateOne(
    { _id: tripId, "intersectionLists._id": listId },
    { $set: { "intersectionLists.$.name": name.trim() } }
  );

  return c.json({});
});

// Remove one source list; recompute the intersection, or fall back to the global list
// when the last source list is removed.
trip.delete("/lifelist/intersection/lists/:listId", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  const listId: string | undefined = c.req.param("listId");
  if (!tripId || !listId) throw new HTTPException(400, { message: "Trip ID and list ID are required" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const remaining = (existing.intersectionLists || []).filter((l: IntersectionList) => String(l._id) !== listId);
  const now = new Date();

  if (remaining.length === 0) {
    await Trip.updateOne(
      { _id: tripId },
      { $set: { intersectionLists: [], customLifelist: null, customLifelistUpdatedAt: null } }
    );
  } else {
    await Trip.updateOne(
      { _id: tripId },
      {
        $pull: { intersectionLists: { _id: listId } },
        $set: { customLifelist: computeIntersection(remaining), customLifelistUpdatedAt: now },
      }
    );
  }

  return c.json({});
});

// Add a single species to this trip's custom life list (marking it "seen").
// Only meaningful when the trip already has a custom list.
trip.post("/lifelist/add", async (c) => {
  const session = await authenticate(c);
  const tripId: string | undefined = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const { code } = await c.req.json<AddToLifelistInput>();
  if (!code) throw new HTTPException(400, { message: "Missing code" });

  await connect();
  const existing = await Trip.findById(tripId).lean();
  if (!existing) throw new HTTPException(404, { message: "Trip not found" });
  if (!existing.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  if (existing.intersectionLists?.length) {
    // Shared mode: mark the species seen for the whole group by adding it to every source
    // list, so it survives the next recompute and drops out of the intersection's targets.
    await Trip.updateOne(
      { _id: tripId },
      { $addToSet: { "intersectionLists.$[].codes": code, customLifelist: code } }
    );
  } else {
    await Trip.updateOne({ _id: tripId }, { $addToSet: { customLifelist: code } });
  }

  return c.json({});
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
  if (!existing.userIds.includes(session.uid)) {
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
