import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type Params = { params: Promise<{ id: string; hotspotId: string }> };
type Body = { code: string };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const data: Body = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
    if (!hotspot) return APIError("Hotspot not found", 404);

    await Trip.updateOne({ _id: id, "hotspots.id": hotspotId }, { $pull: { "hotspots.$.favs": { code: data.code } } });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error removing fav", 500);
  }
}
