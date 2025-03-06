import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import { HotspotFav } from "lib/types";

type ParamsT = { id: string; hotspotId: string };

export async function POST(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, hotspotId } = await params;
    const data: HotspotFav = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
    if (!hotspot) return APIError("Hotspot not found", 404);

    if (hotspot.favs?.find((it) => it.code === data.code)) return Response.json({});

    await Trip.updateOne({ _id: id, "hotspots.id": hotspotId }, { $push: { "hotspots.$.favs": data } });

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error adding hotspot", 500);
  }
}
