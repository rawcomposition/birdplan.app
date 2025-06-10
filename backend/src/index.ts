import { serve } from "@hono/node-server";
import { Hono } from "hono";
import trips from "./trips/index.js";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.route("/trips", trips);

app.onError((err, c) => {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  const status = err instanceof HTTPException ? err.status : 500;
  return c.json({ message }, status);
});

serve(
  {
    fetch: app.fetch,
    port: 5100,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
