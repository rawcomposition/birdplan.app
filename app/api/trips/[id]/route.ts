import { authenticate, APIError } from "lib/api";
import { connect, Trip, TargetList, Invite } from "lib/db";
import { TargetListType } from "lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);
    return Response.json(trip);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading trip", 500);
  }
}

type BodyT = {
  name: string;
  startMonth: number;
  endMonth: number;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const data: BodyT = await request.json();

    const hasChangedDates = data.startMonth !== trip.startMonth || data.endMonth !== trip.endMonth;
    const newData = { name: data.name, startMonth: data.startMonth, endMonth: data.endMonth };

    if (hasChangedDates) {
      await Promise.all([
        Trip.updateOne(
          { _id: id },
          { ...newData, hotspots: trip.hotspots?.map(({ targetsId, ...hotspot }) => hotspot) || [] }
        ),
        TargetList.deleteMany({ tripId: id, type: TargetListType.hotspot }),
      ]);
    } else {
      await Trip.updateOne({ _id: id }, newData);
    }

    return Response.json({ hasChangedDates });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error updating trip", 500);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { id } = await params;

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (trip.ownerId !== session.uid) return APIError("Forbidden", 403);
    await Promise.all([
      Trip.deleteOne({ _id: id }),
      TargetList.deleteMany({ tripId: id }),
      Invite.deleteMany({ tripId: id }),
    ]);

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error deleting trip", 500);
  }
}
