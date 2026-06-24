import { serve } from "@hono/node-server";
import { Hono } from "hono";
import trips from "routes/trips/index.js";
import account from "routes/account.js";
import profile from "routes/profile.js";
import auth from "routes/auth.js";
import contact from "routes/contact.js";
import taxonomy from "routes/taxonomy.js";
import region from "routes/region.js";
import ebirdProxy from "routes/ebird-proxy.js";
import participants from "routes/participants.js";
import admin from "routes/admin.js";
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
app.route("/v1/contact", contact);
app.route("/v1/taxonomy", taxonomy);
app.route("/v1/region", region);
app.route("/v1/ebird-proxy", ebirdProxy);
app.route("/v1/participants", participants);
app.route("/v1/admin", admin);

app.notFound((c) => {
  return c.json({ message: "Not Found" }, 404);
});

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ message: err.message }, err.status);
  console.error(err);
  return c.json({ message: "Something went wrong. Please try again." }, 500);
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
