import { connect, Profile } from "lib/db";
import { auth } from "lib/firebaseAdmin";
import { APIError } from "lib/api";
import dayjs from "dayjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return APIError("Missing required fields", 400);
    }

    await connect();

    const profile = await Profile.findOne({ resetToken: token }).lean();

    if (!profile || !profile.uid) {
      return APIError("Invalid or expired token", 400);
    }

    const user = await auth.getUser(profile.uid);

    if (user.providerData.some((provider) => provider.providerId === "google.com")) {
      return APIError("You must use 'Sign in with Google' to login", 400);
    } else if (user.providerData.some((provider) => provider.providerId === "apple.com")) {
      return APIError("You must use 'Sign in with Apple' to login", 400);
    }

    if (!profile.resetTokenExpires || dayjs().isAfter(dayjs(profile.resetTokenExpires))) {
      return APIError("Reset token has expired", 400);
    }

    await auth.updateUser(user.uid, { password });

    await Profile.updateOne({ uid: user.uid }, { $unset: { resetToken: "", resetTokenExpires: "" } });

    return Response.json({ message: "Password reset successfully" });
  } catch (error: unknown) {
    console.error("Unable to change password:", error);
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
