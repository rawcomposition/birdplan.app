import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, User, Trip } from "lib/db.js";
import type { AdminDashboard, AdminDashboardUser } from "@birdplan/shared";

const admin = new Hono();

admin.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();

  const requester = await User.findOne({ _id: session.userId }).select("isAdmin").lean();
  if (!requester?.isAdmin) throw new HTTPException(403, { message: "Forbidden" });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalUsers, activeUsers30d, activeUsers6mo, totalTrips, trips30d, trips6mo, userDocs] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ lastActiveAt: { $gte: sixMonthsAgo } }),
    Trip.countDocuments({}),
    Trip.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Trip.countDocuments({ createdAt: { $gte: sixMonthsAgo } }),
    User.find({}).select("name email photoUrl lastActiveAt lastAuthenticatedAt createdAt").lean(),
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

  const response: AdminDashboard = {
    stats: {
      users: { total: totalUsers, active30d: activeUsers30d, active6mo: activeUsers6mo },
      trips: { total: totalTrips, created30d: trips30d, created6mo: trips6mo },
    },
    users,
  };

  return c.json(response);
});

export default admin;
