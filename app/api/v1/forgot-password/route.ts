import { connect, Profile } from "lib/db";
import { auth } from "lib/firebaseAdmin";
import { sendResetEmail } from "lib/email";
import { nanoId } from "lib/helpers";
import { APIError } from "lib/api";
import dayjs from "dayjs";
import { RESET_TOKEN_EXPIRATION } from "lib/config";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return APIError("Email is required", 400);
    }

    await connect();
    const user = await auth.getUserByEmail(email);

    if (!user || !user.providerData.some((provider) => provider.providerId === "password")) {
      return Response.json({});
    }

    const resetToken = nanoId(64);
    const resetTokenExpires = dayjs().add(RESET_TOKEN_EXPIRATION, "hours").toDate();
    const url = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

    await Profile.updateOne({ uid: user.uid }, { resetToken, resetTokenExpires });
    await sendResetEmail({ email, url });

    return Response.json({});
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "An error occurred", 500);
  }
}
