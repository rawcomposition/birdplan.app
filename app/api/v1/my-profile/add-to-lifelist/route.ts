import { authenticate, APIError } from "lib/api";
import { connect, Profile } from "lib/db";

type BodyT = {
  code: string;
};

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();

    const data: BodyT = await request.json();
    const { code } = data;

    await Profile.updateOne({ uid: session.uid }, { $addToSet: { lifelist: code }, $pull: { exclusions: code } });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error updating profile", 500);
  }
}
