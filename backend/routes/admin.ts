import { Hono } from "hono";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, User, Trip, Log } from "lib/db.js";
import { issueMagicLink } from "lib/magicLink.js";
import { findOrCreateUserByEmail, normalizeEmail, isValidEmail } from "lib/users.js";
import { logEvent } from "lib/log.js";
import type { AdminDashboard, AdminDashboardUser, AdminDashboardLog, GenerateMagicLinkResponse, User as UserType } from "@birdplan/shared";

const admin = new Hono();

const getIp = (c: Context) => c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

const requireAdmin = async (c: Context) => {
  const session = await authenticate(c);
  await connect();
  const requester = await User.findOne({ _id: session.userId }).select("isAdmin email").lean();
  if (!requester?.isAdmin) throw new HTTPException(403, { message: "Forbidden" });
  return requester;
};

const buildMagicLink = async (
  c: Context,
  user: Pick<UserType, "_id" | "email">,
  admin: Pick<UserType, "_id" | "email">,
  extra?: Record<string, unknown>
): Promise<GenerateMagicLinkResponse> => {
  const { token, expiresAt } = await issueMagicLink(user._id, admin._id);
  const url = `${process.env.FRONTEND_URL}/magic/${token}`;

  await logEvent({
    type: "magic_link_generated",
    userId: user._id,
    email: user.email,
    ip: getIp(c),
    data: { byUserId: admin._id, byEmail: admin.email, ...extra },
  });

  return { url, expiresAt: expiresAt.toISOString(), email: user.email };
};

admin.get("/", async (c) => {
  await requireAdmin(c);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalUsers, activeUsers30d, activeUsers6mo, totalTrips, trips30d, trips6mo, userDocs, logDocs] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ lastActiveAt: { $gte: sixMonthsAgo } }),
    Trip.countDocuments({}),
    Trip.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Trip.countDocuments({ createdAt: { $gte: sixMonthsAgo } }),
    User.find({}).select("name email photoUrl lastActiveAt lastAuthenticatedAt createdAt").lean(),
    Log.find({}).sort({ createdAt: -1 }).limit(200).lean(),
  ]);

  const users: AdminDashboardUser[] = userDocs.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl,
    createdAt: (user as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
    lastActiveAt: user.lastActiveAt ?? null,
    lastAuthenticatedAt: user.lastAuthenticatedAt ?? null,
  }));

  const logs: AdminDashboardLog[] = logDocs.map((log) => ({
    _id: log._id,
    type: log.type,
    email: log.email ?? null,
    userId: log.userId ?? null,
    ip: log.ip ?? null,
    data: log.data ?? null,
    createdAt: (log as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
  }));

  const response: AdminDashboard = {
    stats: {
      users: { total: totalUsers, active30d: activeUsers30d, active6mo: activeUsers6mo },
      trips: { total: totalTrips, created30d: trips30d, created6mo: trips6mo },
    },
    users,
    logs,
  };

  return c.json(response);
});

admin.post("/users/:userId/magic-link", async (c) => {
  const requester = await requireAdmin(c);
  const userId = c.req.param("userId");

  const user = await User.findOne({ _id: userId }).select("email").lean();
  if (!user) throw new HTTPException(404, { message: "User not found" });

  return c.json(await buildMagicLink(c, user, requester));
});

admin.post("/magic-link", async (c) => {
  const requester = await requireAdmin(c);
  const { email: rawEmail } = await c.req.json<{ email: string }>();
  const email = normalizeEmail(rawEmail);

  if (!email || !isValidEmail(email)) throw new HTTPException(400, { message: "A valid email is required" });

  const { user, isNewUser } = await findOrCreateUserByEmail(email);

  const link = await buildMagicLink(c, user, requester, { isNewUser });
  return c.json<GenerateMagicLinkResponse>({ ...link, isNewUser });
});

export default admin;
