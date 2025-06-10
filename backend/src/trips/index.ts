import { Hono } from "hono";
import trip from "./[id]/index.js";
import { authenticate } from "lib/utils.js";
import { connect, Trip } from "lib/db.js";
import { HTTPException } from "hono/http-exception";

const trips = new Hono();

trips.route("/:id", trip);

trips.get("/", async (c) => {
  try {
    const session = await authenticate(c);

    await connect();
    const trips = await Trip.find({ userIds: session.uid }).sort({ createdAt: -1 }).lean();
    return c.json(trips);
  } catch (error: unknown) {
    throw new HTTPException(500, { message: "Error loading trips" });
  }
});

export default trips;
