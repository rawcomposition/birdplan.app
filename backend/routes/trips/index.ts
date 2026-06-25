import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { rateLimiter } from "hono-rate-limiter";
import trip from "./[tripId]/index.js";
import { authenticate, getBounds } from "lib/utils.js";
import { connect, Trip, Participant, IntegrationToken, User } from "lib/db.js";
import { uploadMapboxImageToStorage, imageUrl } from "lib/storage.js";
import { SHARE_CODE_TTL_MINUTES } from "lib/config.js";
import type { TripInput } from "@birdplan/shared";

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

trips.route("/:tripId", trip);

trips.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  const tripIds = await Participant.find({ userId: session.userId, status: "active" }).distinct("tripId");
  const trips = await Trip.find({ _id: { $in: tripIds } })
    .sort({ createdAt: -1 })
    .lean();
  return c.json(trips.map((trip) => ({ ...trip, imgUrl: imageUrl(trip.imgUrl) })));
});

trips.post("/", async (c) => {
  const session = await authenticate(c);

  const data = await c.req.json<TripInput>();

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
