import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";

type ParamsT = { id: string };

export async function POST(request: Request, { params }: { params: ParamsT }) {
  const { id } = await params;
  const session = await authenticate(request);
  if (!session?.uid) return APIError("Unauthorized", 401);

  await connect();
  const trip = await Trip.findById(id);
  if (!trip) return APIError("Trip not found", 404);
  if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

  const data = await request.json();
  // TODO: add hotspot to trip
  return Response.json(location);
}
