import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import dayjs from "dayjs";
import { connect, User, Session } from "lib/db.js";
import { authenticate } from "lib/utils.js";
import { findOrCreateUserByEmail, normalizeEmail, isValidEmail } from "lib/users.js";
import { createSession, invalidateSession } from "lib/session.js";
import { issueOtp, verifyOtp } from "lib/otp.js";
import { redeemMagicLink } from "lib/magicLink.js";
import { enforceRateLimit } from "lib/rateLimit.js";
import { logEvent } from "lib/log.js";
import { sendNtfyNotification } from "lib/notify.js";
import { SESSION_INACTIVITY_DAYS, RATE_LIMITS } from "lib/config.js";
import type { RedeemMagicLinkResponse } from "@birdplan/shared";

const auth = new Hono();

const getIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

auth.post("/request-code", async (c) => {
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);

  if (!email || !isValidEmail(email)) return c.json({ ok: true });

  await connect();

  const emailOk = await enforceRateLimit("request_code", "email", email, RATE_LIMITS.requestCodeEmail);
  const ipOk = await enforceRateLimit("request_code", "ip", ip, RATE_LIMITS.requestCodeIp);
  if (!emailOk || !ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  await issueOtp(email, ip);

  return c.json({ ok: true });
});

auth.post("/otp-not-received", async (c) => {
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);

  if (!email || !isValidEmail(email)) return c.json({ ok: true });

  await connect();

  const emailOk = await enforceRateLimit("otp_not_received", "email", email, RATE_LIMITS.otpNotReceivedEmail);
  const ipOk = await enforceRateLimit("otp_not_received", "ip", ip, RATE_LIMITS.otpNotReceivedIp);
  if (!emailOk || !ipOk) return c.json({ ok: true });

  await logEvent({ type: "otp_not_received", email, ip });
  await sendNtfyNotification("📭 OTP not received", `${email} reported not receiving their sign-in code.`);

  return c.json({ ok: true });
});

auth.post("/verify-code", async (c) => {
  const { email: rawEmail, code } = await c.req.json<{ email: string; code: string }>();
  const email = normalizeEmail(rawEmail);
  const ip = getIp(c);

  if (!email || !code) throw new HTTPException(400, { message: "Email and code are required" });

  await connect();

  const emailOk = await enforceRateLimit("verify_code", "email", email, RATE_LIMITS.verifyCodeEmail);
  const ipOk = await enforceRateLimit("verify_code", "ip", ip, RATE_LIMITS.verifyCodeIp);
  if (!emailOk || !ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  await verifyOtp(email, code);

  const { user, isNewUser } = await findOrCreateUserByEmail(email);

  const { token } = await createSession(user._id, {
    userAgent: c.req.header("user-agent"),
    ip,
  });

  return c.json({ token, isNewUser });
});

auth.post("/redeem-magic-link", async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  const ip = getIp(c);

  if (!token) throw new HTTPException(400, { message: "Missing token" });

  await connect();

  const ipOk = await enforceRateLimit("redeem_magic_link", "ip", ip, RATE_LIMITS.redeemMagicLinkIp);
  if (!ipOk) throw new HTTPException(429, { message: "Too many requests. Please try again later." });

  const { sessionToken, userId } = await redeemMagicLink(token, {
    userAgent: c.req.header("user-agent"),
    ip,
  });

  await logEvent({ type: "magic_link_redeemed", userId, ip });

  return c.json<RedeemMagicLinkResponse>({ token: sessionToken });
});

auth.get("/me", async (c) => {
  const session = await authenticate(c);

  await connect();
  const user = await User.findOne({ _id: session.userId }).lean();
  if (!user) {
    await invalidateSession(session._id);
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const nowDate = new Date();
  const expiresAt = dayjs(nowDate).add(SESSION_INACTIVITY_DAYS, "day").toDate();
  await Promise.all([
    Session.updateOne({ _id: session._id }, { $set: { lastActiveAt: nowDate, expiresAt } }),
    User.updateOne({ _id: session.userId }, { $set: { lastActiveAt: nowDate } }),
  ]);

  return c.json(user);
});

auth.post("/logout", async (c) => {
  const session = await authenticate(c);
  await invalidateSession(session._id);
  return c.json({});
});

export default auth;
