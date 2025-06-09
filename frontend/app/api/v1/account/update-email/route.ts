import { authenticate, APIError } from "lib/api";
import { auth } from "lib/firebaseAdmin";
import Profile from "models/Profile";

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    const { email } = await request.json();
    if (!email) return APIError("Email is required", 400);

    const user = await auth.getUser(session.uid);
    if (!user) return APIError("User not found", 404);

    if (!user.providerData.some((provider) => provider.providerId === "password")) {
      return APIError("Cannot update email for accounts using external authentication providers", 400);
    }

    await Promise.all([auth.updateUser(user.uid, { email }), Profile.updateOne({ uid: session.uid }, { email })]);

    return Response.json({ message: "Email updated successfully" });
  } catch (error: unknown) {
    console.error("Error updating email:", error);
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
