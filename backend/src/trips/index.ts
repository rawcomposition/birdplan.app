import { Hono } from "hono";
import trip from "./[id]/index.js";
import { authenticate } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";

const trips = new Hono();

trips.route("/:id", trip);

trips.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  const trips = await Trip.find({ userIds: session.uid }).sort({ createdAt: -1 }).lean();
  return c.json(trips);
});

export default trips;
