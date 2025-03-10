import { authenticate, APIError } from "lib/api";
import { connect, Invite, Trip, Profile } from "lib/db";
import { Editor } from "lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const [trip, invites] = await Promise.all([
      Trip.findById(id),
      Invite.find({ tripId: id, uid: { $exists: true } }, ["name", "email"]),
    ]);

    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    if (invites.length === 0) return Response.json([]);

    const uids = invites.map((invite) => invite.uid);
    const profiles = await Profile.find({ uid: { $in: uids } });

    const editors: Editor[] = invites.map((invite) => {
      const profile = profiles.find((profile) => profile.uid === invite.uid);
      return {
        uid: invite.uid!,
        name: invite?.name || `User ${invite.uid}`,
        lifelist: profile?.lifelist || [],
      };
    });

    return Response.json(editors);
  } catch (error: any) {
    return APIError(error?.message || "Error loading invites", 500);
  }
}
