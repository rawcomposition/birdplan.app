import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { connect, Vault } from "lib/db.js";

const piper = new Hono();

piper.post("/set-cookiejar", async (c) => {
  const key: string | undefined = c.req.query("key");

  if (!key || key !== process.env.PIPER_KEY) {
    throw new HTTPException(401, { message: "Invalid key" });
  }

  const rawBody: string = await c.req.text();
  if (!rawBody) {
    throw new HTTPException(400, { message: "Missing body" });
  }

  await connect();
  await Vault.updateOne({ key: "ebird-tools" }, { value: rawBody }, { upsert: true });

  return c.text("Success", 200);
});

piper.get("/get-cookiejar", async (c) => {
  const key: string | undefined = c.req.query("key");
  if (!key || key !== process.env.PIPER_KEY) {
    throw new HTTPException(401, { message: "Invalid key" });
  }

  await connect();
  const vault = await Vault.findOne({ key: "ebird-tools" });
  const cookiejar: string = vault?.value || "";

  return c.text(cookiejar, 200, {
    "Content-Type": "text/plain",
  });
});

export default piper;
