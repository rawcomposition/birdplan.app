import { authenticate, APIError } from "lib/api";
import { connect, Location, Trip } from "lib/db";

type ParamsT = { id: string };

export async function GET(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const [trip, locations] = await Promise.all([Trip.findById(id), Location.find({ tripId: id })]);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    return Response.json(locations);
  } catch (error: any) {
    return APIError(error?.message || "Error fetching locations", 500);
  }
}

export async function POST(request: Request, { params }: { params: ParamsT }) {
  const { id } = await params;
  const session = await authenticate(request);
  if (!session?.uid) return APIError("Unauthorized", 401);

  const trip = await Trip.findById(id);
  if (!trip) return APIError("Trip not found", 404);
  if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

  const data = await request.json();
  const location = await Location.create({ ...data, tripId: id });
  return Response.json(location);
}
