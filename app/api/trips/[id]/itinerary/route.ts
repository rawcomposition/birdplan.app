import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string };

export async function POST(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    if (trip.itinerary?.find((it) => it.id === data.id)) return Response.json({});

    await trip.updateOne({ $push: { itinerary: data } });
    return Response.json({});
  } catch (error: any) {
    return APIError(error?.message || "Error adding itinerary day", 500);
  }
}
