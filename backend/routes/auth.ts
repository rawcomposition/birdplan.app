import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import dayjs from "dayjs";
import { connect, User, Session } from "lib/db.js";
import { authenticate, isDuplicateKeyError } from "lib/utils.js";
import { createSession, invalidateSession } from "lib/session.js";
import { issueOtp, verifyOtp } from "lib/otp.js";
import { enforceRateLimit } from "lib/rateLimit.js";
import { SESSION_INACTIVITY_DAYS, SESSION_REFRESH_THRESHOLD_HOURS, RATE_LIMITS } from "lib/config.js";

const auth = new Hono();

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  let user = await User.findOne({ email }).lean();
  let isNewUser = false;
  if (!user) {
    try {
      user = (await User.create({ email })).toObject();
      isNewUser = true;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        user = await User.findOne({ email }).lean();
      } else {
        throw err;
      }
    }
  }
  if (!user) throw new HTTPException(500, { message: "Failed to create account" });

  const { token } = await createSession(user._id, {
    userAgent: c.req.header("user-agent"),
    ip,
  });

  return c.json({ token, isNewUser });
});

auth.get("/me", async (c) => {
  const session = await authenticate(c);

  await connect();
  const user = await User.findOne({ _id: session.userId }).lean();
  if (!user) {
    await invalidateSession(session._id);
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const now = Date.now();
  const lastActive = new Date(session.lastActiveAt).getTime();
  if (now - lastActive > SESSION_REFRESH_THRESHOLD_HOURS * 60 * 60 * 1000) {
    const nowDate = new Date();
    const expiresAt = dayjs(nowDate).add(SESSION_INACTIVITY_DAYS, "day").toDate();
    await Session.updateOne({ _id: session._id }, { $set: { lastActiveAt: nowDate, expiresAt } });
    await User.updateOne({ _id: session.userId }, { $set: { lastActiveAt: nowDate } });
  }

  return c.json(user);
});

auth.post("/logout", async (c) => {
  const session = await authenticate(c);
  await invalidateSession(session._id);
  return c.json({});
});

export default auth;
