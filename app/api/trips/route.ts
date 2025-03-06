import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { TripInput } from "lib/types";
import { getBounds, getCenterOfBounds, uploadMapboxImg } from "lib/helpers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { find: findTz } = require("geo-tz");

export async function GET(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trips = await Trip.find({ userIds: session.uid }).sort({ createdAt: -1 }).lean();
    return Response.json(trips);
  } catch (error: any) {
    return APIError(error?.message || "Error loading trips", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: TripInput = await request.json();

    const bounds = await getBounds(data.region);
    if (!bounds) throw new Error("Failed to fetch region info");
    const { lat, lng } = getCenterOfBounds(bounds);
    //const imgUrl = await uploadMapboxImg(bounds);
    const timezone = findTz(lat, lng)?.[0] || "America/New_York";
    const imgUrl = ""; // TODO

    await connect();
    const trip = await Trip.create({
      ...data,
      userIds: [session.uid],
      ownerId: session.uid,
      ownerName: session.name,
      bounds,
      timezone,
      imgUrl,
      itinerary: [],
      hotspots: [],
      markers: [],
    });
    return Response.json({ id: trip._id });
  } catch (error: any) {
    return APIError(error?.message || "Error creating trip", 500);
  }
}
