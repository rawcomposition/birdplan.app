import { authenticate, APIError } from "lib/api";
import { auth } from "lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    const { password } = await request.json();

    if (!password || password.length < 6) {
      return APIError("Password must be at least 6 characters", 400);
    }

    const user = await auth.getUser(session.uid);

    if (!user.providerData.some((provider) => provider.providerId === "password")) {
      return APIError("Cannot update password for accounts using external authentication providers", 400);
    }

    await auth.updateUser(user.uid, { password });

    return Response.json({ message: "Password updated successfully" });
  } catch (error: unknown) {
    console.error("Error updating password:", error);
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
