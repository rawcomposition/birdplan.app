import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { TripInput } from "lib/types";
import { getBounds } from "lib/helpers";
import { uploadMapboxImageToStorage } from "lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trips = await Trip.find({ userIds: session.uid }).sort({ createdAt: -1 }).lean();
    return Response.json(trips);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading trips", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: TripInput = await request.json();

    const bounds = await getBounds(data.region);
    if (!bounds) throw new Error("Failed to fetch region info");

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
    return Response.json({ id: trip._id });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error creating trip", 500);
  }
}
