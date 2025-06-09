import { serve } from "@hono/node-server";
import { Hono } from "hono";
import trips from "./trips/index.js";
import users from "./users/index.js";

const app = new Hono();

app.route("/trips", trips);
app.route("/users", users);

app.get("/", (c) => {
  return c.text("Hello Hono!");
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
