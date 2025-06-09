import { Hono } from "hono";
import trip from "./[id]/index.js";

const trips = new Hono();

trips.route("/:id", trip);

trips.get("/", (c) => c.text("List Trips"));

export default trips;
