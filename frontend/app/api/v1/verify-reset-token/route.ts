import { connect, Profile } from "lib/db";
import { APIError } from "lib/api";
import dayjs from "dayjs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) return APIError("Token is required", 400);

    await connect();
    const profile = await Profile.findOne({ resetToken: token }).lean();

    if (!profile || !profile.resetTokenExpires || dayjs().isAfter(dayjs(profile.resetTokenExpires))) {
      return APIError("Invalid or expired token", 400);
    }

    return Response.json({ isValid: true });
  } catch (error: unknown) {
    console.error("Error verifying reset token:", error);
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
