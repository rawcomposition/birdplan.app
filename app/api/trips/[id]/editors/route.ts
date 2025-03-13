import { authenticate, APIError } from "lib/api";
import { connect, Trip, Profile } from "lib/db";
import { Editor } from "lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await authenticate(request);

    await connect();
    const trip = await Trip.findById(id);

    if (!trip) return APIError("Trip not found", 404);
    if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid))) return APIError("Forbidden", 403);

    if (trip.userIds.length === 0) return Response.json([]);

    const profiles = await Profile.find({ uid: { $in: trip.userIds } });

    const editors: Editor[] = profiles.map((profile) => {
      return {
        uid: profile.uid!,
        name: profile?.name || `User ${profile.uid}`,
        lifelist: profile?.lifelist || [],
      };
    });

    return Response.json(editors);
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error loading invites", 500);
  }
}
