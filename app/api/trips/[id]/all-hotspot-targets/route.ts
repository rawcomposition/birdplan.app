import { authenticate, APIError } from "lib/api";
import { connect, TargetList, Trip } from "lib/db";
import { TargetListType } from "lib/types";

type ParamsT = { id: string };

export async function GET(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const [trip, results] = await Promise.all([
      Trip.findById(id),
      TargetList.find({ type: TargetListType.hotspot, tripId: id }).sort({ createdAt: -1 }),
    ]);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    return Response.json(results);
  } catch (error: any) {
    return APIError(error?.message || "Error fetching targets", 500);
  }
}
