import { Hono } from "hono";
import { nanoId } from "lib/utils.js";
import { connect, Profile } from "lib/db.js";
import { HTTPException } from "hono/http-exception";
import dayjs from "dayjs";
import { RESET_TOKEN_EXPIRATION } from "lib/config.js";
import { sendResetEmail } from "lib/email.js";
import { auth as firebaseAuth } from "lib/firebaseAdmin.js";

const auth = new Hono();

auth.post("/forgot-password", async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!email) throw new HTTPException(400, { message: "Email is required" });

  await connect();
  const user = await firebaseAuth.getUserByEmail(email);

  if (!user || !user.providerData.some((provider) => provider.providerId === "password")) {
    console.log("User not found/invalid provider", user?.providerData);
    return Response.json({});
  }

  const resetToken = nanoId(64);
  const resetTokenExpires = dayjs().add(RESET_TOKEN_EXPIRATION, "hours").toDate();
  const url = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

  await Profile.updateOne({ uid: user.uid }, { resetToken, resetTokenExpires });
  await sendResetEmail({ email, url });
  return c.json({});
});

auth.post("/reset-password", async (c) => {
  const { token, password } = await c.req.json<{ token: string; password: string }>();
  if (!token || !password) throw new HTTPException(400, { message: "Missing required fields" });

  await connect();
  const profile = await Profile.findOne({ resetToken: token }).lean();

  if (!profile || !profile.uid) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  const user = await firebaseAuth.getUser(profile.uid);

  if (user.providerData.some((provider) => provider.providerId === "google.com")) {
    throw new HTTPException(400, { message: "You must use 'Sign in with Google' to login" });
  } else if (user.providerData.some((provider) => provider.providerId === "apple.com")) {
    throw new HTTPException(400, { message: "You must use 'Sign in with Apple' to login" });
  }

  if (!profile.resetTokenExpires || dayjs().isAfter(dayjs(profile.resetTokenExpires))) {
    throw new HTTPException(400, { message: "Reset token has expired" });
  }

  await firebaseAuth.updateUser(user.uid, { password });

  await Profile.updateOne({ uid: user.uid }, { $unset: { resetToken: "", resetTokenExpires: "" } });

  return c.json({ message: "Password reset successfully" });
});

auth.get("/verify-reset-token", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const token = searchParams.get("token");

  if (!token) throw new HTTPException(400, { message: "Token is required" });

  await connect();
  const profile = await Profile.findOne({ resetToken: token }).lean();

  if (!profile || !profile.resetTokenExpires || dayjs().isAfter(dayjs(profile.resetTokenExpires))) {
    throw new HTTPException(400, { message: "Invalid or expired token" });
  }

  return c.json({ isValid: true });
});

export default auth;
