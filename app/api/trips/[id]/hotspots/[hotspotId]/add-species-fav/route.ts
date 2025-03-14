import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { HotspotFav } from "lib/types";

type Params = { params: Promise<{ id: string; hotspotId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const data: HotspotFav = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
    if (!hotspot) return APIError("Hotspot not found", 404);

    if (hotspot.favs?.find((it) => it.code === data.code)) return Response.json({});

    await Trip.updateOne({ _id: id, "hotspots.id": hotspotId }, { $push: { "hotspots.$.favs": data } });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error adding hotspot", 500);
  }
}
