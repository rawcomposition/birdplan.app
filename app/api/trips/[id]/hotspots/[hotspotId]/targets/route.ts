import { authenticate, APIError } from "lib/api";
import { connect, TargetList, Trip } from "lib/db";
import { TargetListInput, TargetListType } from "lib/types";

type Params = { params: Promise<{ id: string; hotspotId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id, hotspotId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const [trip, targetList] = await Promise.all([
      Trip.findById(id),
      TargetList.findOne({ type: TargetListType.hotspot, tripId: id, hotspotId }).sort({ createdAt: -1 }),
    ]);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    return Response.json(targetList || null);
  } catch (error: any) {
    return APIError(error?.message || "Error loading targets", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const data: TargetListInput = await request.json();

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    if (!data.hotspotId) return APIError("Hotspot ID is required", 400);
    const targetList = await TargetList.findOneAndUpdate(
      { type: TargetListType.hotspot, tripId: id, hotspotId: data.hotspotId },
      {
        ...data,
        type: TargetListType.hotspot,
        tripId: id,
        hotspotId: data.hotspotId,
      },
      { upsert: true, new: true }
    );
    if (targetList._id) {
      await Trip.updateOne(
        { _id: id, "hotspots.id": data.hotspotId },
        { $set: { "hotspots.$.targetsId": targetList._id } }
      );
    }
    return Response.json({ id: targetList._id });
  } catch (error: any) {
    return APIError(error?.message || "Error saving targets", 500);
  }
}
