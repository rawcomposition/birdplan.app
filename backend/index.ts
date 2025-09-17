import { serve } from "@hono/node-server";
import { Hono } from "hono";
import trips from "routes/trips/index.js";
import account from "routes/account.js";
import profile from "routes/profile.js";
import auth from "routes/auth.js";
import support from "routes/support.js";
import taxonomy from "routes/taxonomy.js";
import piper from "routes/piper.js";
import region from "routes/region.js";
import ebirdProxy from "routes/ebird-proxy.js";
import invites from "routes/invites.js";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";

const app = new Hono();

if (process.env.CORS_ORIGINS) {
  app.use("*", cors({ origin: process.env.CORS_ORIGINS.split(",") }));
} else {
  console.error("CORS_ORIGINS is not set");
}

app.route("/v1/profile", profile);
app.route("/v1/account", account);
app.route("/v1/trips", trips);
app.route("/v1/auth", auth);
app.route("/v1/support", support);
app.route("/v1/taxonomy", taxonomy);
app.route("/v1/piper", piper);
app.route("/v1/region", region);
app.route("/v1/ebird-proxy", ebirdProxy);
app.route("/v1/invites", invites);

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
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
