import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip } from "lib/db";
import { InviteInput } from "lib/types";
import { sendInviteEmail } from "lib/email";

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);
    const { email, tripId }: InviteInput = await request.json();

    await connect();

    const trip = await Trip.findById(tripId);
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const invite = await Invite.create({
      email,
      tripId,
      ownerId: session.uid,
      accepted: false,
    });

    await sendInviteEmail({
      tripName: trip.name,
      fromName: session.name || "",
      email,
      url: `${process.env.NEXT_PUBLIC_URL}/accept/${invite._id}`,
    });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error creating trip", 500);
  }
}
