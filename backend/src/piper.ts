import { Hono } from "hono";
import { connect, Vault } from "lib/db.js";

const piper = new Hono();

piper.post("/set-cookiejar", async (c) => {
  const key: string | undefined = c.req.query("key");

  if (!key || key !== process.env.PIPER_KEY) {
    return c.json({ error: "Invalid key" }, 401);
  }

  const rawBody: string = await c.req.text();
  if (!rawBody) {
    return c.json({ error: "Missing body" }, 400);
  }

  await connect();
  await Vault.updateOne({ key: "ebird-tools" }, { value: rawBody }, { upsert: true });

  return c.text("Success", 200);
});

piper.get("/get-cookiejar", async (c) => {
  const key: string | undefined = c.req.query("key");
  if (!key || key !== process.env.PIPER_KEY) {
    return c.json({ error: "Invalid key" }, 401);
  }

  await connect();
  const vault = await Vault.findOne({ key: "ebird-tools" });
  const cookiejar: string = vault?.value || "";

  return c.text(cookiejar, 200, {
    "Content-Type": "text/plain",
  });
});

export default piper;
