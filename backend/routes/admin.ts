import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Profile, Trip } from "lib/db.js";
import type { AdminDashboard, AdminDashboardUser } from "@birdplan/shared";

const admin = new Hono();

admin.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();

  const requester = await Profile.findOne({ uid: session.uid }).select("isAdmin").lean();
  if (!requester?.isAdmin) throw new HTTPException(403, { message: "Forbidden" });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalUsers, activeUsers30d, activeUsers6mo, totalTrips, trips30d, trips6mo, profiles] = await Promise.all([
    Profile.countDocuments({}),
    Profile.countDocuments({ lastActiveAt: { $gte: thirtyDaysAgo } }),
    Profile.countDocuments({ lastActiveAt: { $gte: sixMonthsAgo } }),
    Trip.countDocuments({}),
    Trip.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Trip.countDocuments({ createdAt: { $gte: sixMonthsAgo } }),
    Profile.find({}).select("uid name email photoUrl lastActiveAt createdAt").lean(),
  ]);

  const users: AdminDashboardUser[] = profiles.map((profile) => ({
    _id: profile._id,
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    photoUrl: profile.photoUrl,
    createdAt: (profile as unknown as { createdAt: Date }).createdAt?.toISOString?.() ?? "",
    lastActiveAt: profile.lastActiveAt ?? null,
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
