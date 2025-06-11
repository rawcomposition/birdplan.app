import { serve } from "@hono/node-server";
import { Hono } from "hono";
import trips from "./trips/index.js";
import account from "./account.js";
import profile from "./profile.js";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";

const app = new Hono();

if (process.env.FRONTEND_URL) {
  app.use("*", cors({ origin: process.env.FRONTEND_URL }));
} else {
  console.error("FRONTEND_URL is not set");
}

app.route("/v1/profile", profile);
app.route("/v1/account", account);
app.route("/v1/trips", trips);

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

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
