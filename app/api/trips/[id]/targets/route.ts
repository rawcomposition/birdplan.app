import { authenticate, APIError } from "lib/api";
import { connect, TargetList, Trip } from "lib/db";
import { TargetListInput, TargetListType } from "lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);

    await connect();
    const [trip, targetList] = await Promise.all([
      Trip.findById(id),
      TargetList.findOne({ type: TargetListType.trip, tripId: id }).sort({ createdAt: -1 }),
    ]);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid))) return APIError("Forbidden", 403);

    return Response.json(targetList || null);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
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

    const targetList = await TargetList.findOneAndUpdate(
      { type: TargetListType.trip, tripId: id },
      {
        ...data,
        type: TargetListType.trip,
        tripId: id,
      },
      { upsert: true, new: true }
    );

    return Response.json({ id: targetList._id });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error saving targets", 500);
  }
}
