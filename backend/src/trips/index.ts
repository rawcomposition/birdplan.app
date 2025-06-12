import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import trip from "./[id]/index.js";
import { authenticate, getBounds } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";
import { uploadMapboxImageToStorage } from "lib/firebaseAdmin.js";
import type { TripInput } from "shared/types.js";

const trips = new Hono();

trips.route("/:id", trip);

trips.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  const trips = await Trip.find({ userIds: session.uid }).sort({ createdAt: -1 }).lean();
  return c.json(trips);
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
  const trip = await Trip.create({
    ...data,
    userIds: [session.uid],
    ownerId: session.uid,
    ownerName: session.name,
    bounds,
    imgUrl,
    itinerary: [],
    hotspots: [],
    markers: [],
  });

  return c.json({ id: trip._id });
});

export default trips;
