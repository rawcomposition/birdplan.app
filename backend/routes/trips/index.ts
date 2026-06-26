import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { rateLimiter } from "hono-rate-limiter";
import trip from "./[tripId]/index.js";
import { authenticate, getBounds, validateTripDates } from "lib/utils.js";
import { connect, Trip, Participant, IntegrationToken, User } from "lib/db.js";
import { uploadMapboxImageToStorage, imageUrl } from "lib/storage.js";
import { SHARE_CODE_TTL_MINUTES } from "lib/config.js";
import type { TripInput, ParticipantView, TripStats, TripListItem, TripListPage } from "@birdplan/shared";

type ParticipantAvatar = Pick<ParticipantView, "_id" | "userId" | "name" | "photoUrl">;

type TripListRow = {
  _id: string;
  name: string;
  region: string;
  imgUrl: string | null;
  startDate?: string;
  endDate?: string;
  startMonth: number;
  endMonth: number;
  createdAt: Date;
  hotspotCount: number;
};

const encodeCursor = (createdAt: Date, id: string): string =>
  Buffer.from(JSON.stringify({ c: new Date(createdAt).toISOString(), i: id })).toString("base64url");

const decodeCursor = (cursor: string): { c: string; i: string } | null => {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (typeof parsed?.c === "string" && typeof parsed?.i === "string") return parsed;
    return null;
  } catch {
    return null;
  }
};

const shareCodeLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  keyGenerator: (c) => c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
  message: { message: "Too many attempts, please try again later" },
});

const trips = new Hono();

const serializeTripForImport = (trip: any) => ({
  id: trip._id,
  name: trip.name,
  startMonth: trip.startMonth,
  endMonth: trip.endMonth,
  bounds: trip.bounds,
  hotspots: (trip.hotspots || []).map((h: any) => ({
    id: h.id,
    name: h.name,
    lat: h.lat,
    lng: h.lng,
    species: h.species || 0,
    notes: h.notes || null,
    favs: h.favs || [],
  })),
  markers: (trip.markers || []).map((m: any) => ({
    id: m.id,
    name: m.name,
    lat: m.lat,
    lng: m.lng,
    icon: m.icon,
    notes: m.notes || null,
  })),
});

trips.get("/openbirding/:codeOrToken", shareCodeLimiter, async (c) => {
  const codeOrToken = c.req.param("codeOrToken");
  if (!codeOrToken) {
    throw new HTTPException(400, { message: "Code or token is required" });
  }

  await connect();

  const isShareCode = /^\d{6}$/.test(codeOrToken);

  if (isShareCode) {
    const minCreatedAt = new Date(Date.now() - SHARE_CODE_TTL_MINUTES * 60 * 1000);
    const trip = await Trip.findOneAndUpdate(
      { shareCode: codeOrToken, shareCodeCreatedAt: { $gte: minCreatedAt } },
      { $unset: { shareCode: "", shareCodeCreatedAt: "" } },
      { returnDocument: "before" }
    ).lean();

    if (!trip) {
      // Distinguish expired from not found
      const expired = await Trip.findOne({ shareCode: codeOrToken }).lean();
      if (expired) {
        throw new HTTPException(410, { message: "Code has expired" });
      }
      throw new HTTPException(404, { message: "Trip not found" });
    }

    const integrationToken = await IntegrationToken.create({ tripId: trip._id, type: "openbirding" });

    return c.json({ ...serializeTripForImport(trip), updateToken: integrationToken._id });
  }

  const integrationToken = await IntegrationToken.findOneAndUpdate(
    { _id: codeOrToken, type: "openbirding" },
    { $set: { lastUsedAt: new Date() } }
  ).lean();

  if (!integrationToken) {
    throw new HTTPException(404, { message: "Invalid token" });
  }

  const trip = await Trip.findById(integrationToken.tripId).lean();
  if (!trip) {
    throw new HTTPException(404, { message: "Trip not found" });
  }

  return c.json(serializeTripForImport(trip));
});

trips.get("/stats", async (c) => {
  const session = await authenticate(c);

  await connect();
  const tripIds = await Participant.find({ userId: session.userId, status: "active" }).distinct("tripId");

  const [stats] = await Trip.aggregate<TripStats>([
    { $match: { _id: { $in: tripIds } } },
    {
      $project: {
        hotspotCount: { $size: { $ifNull: ["$hotspots", []] } },
        countries: {
          $filter: {
            input: {
              $map: {
                input: { $split: [{ $ifNull: ["$region", ""] }, ","] },
                as: "code",
                in: { $arrayElemAt: [{ $split: ["$$code", "-"] }, 0] },
              },
            },
            as: "code",
            cond: { $ne: ["$$code", ""] },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        tripCount: { $sum: 1 },
        hotspotTotal: { $sum: "$hotspotCount" },
        countrySets: { $push: "$countries" },
      },
    },
    {
      $project: {
        _id: 0,
        tripCount: 1,
        hotspotTotal: 1,
        countryCount: {
          $size: {
            $reduce: {
              input: "$countrySets",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    },
  ]);

  return c.json(stats ?? { tripCount: 0, hotspotTotal: 0, countryCount: 0 });
});

trips.route("/:tripId", trip);

trips.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 12, 1), 50);
  const cursorParam = c.req.query("cursor");
  const cursor = cursorParam ? decodeCursor(cursorParam) : null;

  const tripIds = await Participant.find({ userId: session.userId, status: "active" }).distinct("tripId");

  const match: Record<string, unknown> = { _id: { $in: tripIds } };
  if (cursor) {
    const cursorDate = new Date(cursor.c);
    match.$or = [{ createdAt: { $lt: cursorDate } }, { createdAt: cursorDate, _id: { $lt: cursor.i } }];
  }

  const docs = await Trip.aggregate<TripListRow>([
    { $match: match },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit + 1 },
    {
      $project: {
        name: 1,
        region: 1,
        imgUrl: 1,
        startDate: 1,
        endDate: 1,
        startMonth: 1,
        endMonth: 1,
        createdAt: 1,
        hotspotCount: { $size: { $ifNull: ["$hotspots", []] } },
      },
    },
  ]);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last._id) : null;

  const pageTripIds = page.map((t) => t._id);
  const roster = await Participant.find({ tripId: { $in: pageTripIds }, status: "active" })
    .sort({ createdAt: 1 })
    .lean();
  const userIds = roster.map((p) => p.userId).filter((u): u is string => !!u);
  const users = userIds.length ? await User.find({ _id: { $in: userIds } }).select("photoUrl").lean() : [];
  const photoByUser = new Map(users.map((u) => [u._id, u.photoUrl]));
  const participantsByTrip = new Map<string, ParticipantAvatar[]>();
  for (const p of roster) {
    const list = participantsByTrip.get(p.tripId) ?? [];
    list.push({ _id: p._id, userId: p.userId, name: p.name, photoUrl: p.userId ? photoByUser.get(p.userId) : undefined });
    participantsByTrip.set(p.tripId, list);
  }

  const items: TripListItem[] = page.map((trip) => ({
    _id: trip._id,
    name: trip.name,
    region: trip.region,
    imgUrl: imageUrl(trip.imgUrl),
    startDate: trip.startDate,
    endDate: trip.endDate,
    startMonth: trip.startMonth,
    endMonth: trip.endMonth,
    hotspotCount: trip.hotspotCount,
    participants: participantsByTrip.get(trip._id) ?? [],
  }));

  return c.json({ trips: items, nextCursor } satisfies TripListPage);
});

trips.post("/", async (c) => {
  const session = await authenticate(c);

  const data = await c.req.json<TripInput>();
  validateTripDates(data);

  const bounds = await getBounds(data.region);
  if (!bounds) {
    throw new HTTPException(500, { message: "Failed to fetch region info" });
  }

  const mapboxImgUrl = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/[${bounds?.minX},${bounds?.minY},${bounds?.maxX},${bounds?.maxY}]/300x185@2x?access_token=${process.env.MAPBOX_SERVER_KEY}&padding=30`;
  const imgUrl = await uploadMapboxImageToStorage(mapboxImgUrl);

  await connect();
  const user = await User.findOne({ _id: session.userId }).select("name").lean();
  const ownerName = user?.name || "";

  const trip = await Trip.create({
    ...data,
    ownerId: session.userId,
    ownerName,
    bounds,
    imgUrl,
    itinerary: [],
    hotspots: [],
    markers: [],
  });

  await Participant.create({
    tripId: trip._id,
    userId: session.userId,
    name: ownerName,
    status: "active",
    listMode: "world",
    isOwner: true,
  });

  return c.json({ id: trip._id });
});

export default trips;
