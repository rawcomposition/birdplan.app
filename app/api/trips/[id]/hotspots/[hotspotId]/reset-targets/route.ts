import { authenticate, APIError } from "lib/api";
import { connect, Trip, TargetList } from "lib/db";

type ParamsT = { id: string; hotspotId: string };

export async function PATCH(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, hotspotId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
    if (!hotspot) return APIError("Hotspot not found", 404);

    await Promise.all([
      Trip.updateOne({ _id: id, "hotspots.id": hotspotId }, { $unset: { "hotspots.$.targetsId": "" } }),
      TargetList.deleteMany({ tripId: id, hotspotId }),
    ]);

    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error resetting translation", 500);
  }
}
