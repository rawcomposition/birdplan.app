import { Hono } from "hono";
import hotspots from "./hotspots.js";

const trip = new Hono();

trip.route("/hotspots", hotspots);

trip.get("/", (c) => {
  const id = c.req.param("id");
  return c.text(`Trip ${id}`);
});

trip.delete("/", (c) => {
  const id = c.req.param("id");
  return c.text(`Trip ${id} deleted`);
});

trip.post("/", async (c) => {
  const trip = await c.req.json();
  return c.json(trip);
});

export default trip;
