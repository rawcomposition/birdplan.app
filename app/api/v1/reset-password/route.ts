import { connect, Profile } from "lib/db";
import { auth } from "lib/firebaseAdmin";
import { APIError } from "lib/api";

export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return APIError("Missing required fields", 400);
    }

    await connect();

    const user = await auth.getUserByEmail(email);

    if (user.providerData.some((provider) => provider.providerId === "google.com")) {
      return APIError("This account uses Google to sign in. Please use the 'Sign in with Google' option.", 400);
    } else if (user.providerData.some((provider) => provider.providerId === "apple.com")) {
      return APIError("This account uses Apple to sign in. Please use the 'Sign in with Apple' option.", 400);
    }

    const profile = await Profile.findOne({ uid: user.uid }).lean();

    if (!profile || profile.resetToken !== token) {
      return APIError("Invalid or expired token", 400);
    }

    if (!profile.resetTokenExpires || new Date() > new Date(profile.resetTokenExpires)) {
      return APIError("Reset token has expired. Please request a new password reset.", 400);
    }

    await auth.updateUser(user.uid, { password });

    await Profile.updateOne({ uid: user.uid }, { $unset: { resetToken: "", resetTokenExpires: "" } });

    return Response.json({ message: "Password reset successfully" });
  } catch (error: unknown) {
    console.error("Unable to change password:", error);
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
