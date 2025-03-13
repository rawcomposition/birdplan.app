import { APIError } from "lib/api";
import { connect, TargetList, Trip } from "lib/db";
import { TargetListType } from "lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    await connect();
    const [trip, results] = await Promise.all([
      Trip.findById(id),
      TargetList.find({ type: TargetListType.hotspot, tripId: id }).sort({ createdAt: -1 }),
    ]);
    if (!trip) return APIError("Trip not found", 404);

    return Response.json(results);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading targets", 500);
  }
}
