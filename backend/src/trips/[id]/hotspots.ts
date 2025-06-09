import { Hono } from "hono";

const hotspots = new Hono();

hotspots.get("/", (c) => c.text("List Hotspots"));

export default hotspots;
