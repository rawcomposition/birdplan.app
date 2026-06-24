import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, User, Participant } from "lib/db.js";
import { sciNamesToCodes } from "lib/taxonomy.js";
import { HTTPException } from "hono/http-exception";
import type { LifelistImportInput, AddToLifelistInput } from "@birdplan/shared";

const profile = new Hono();

type BodyT = {
  name?: string;
  exceptions?: string[];
  dismissedNoticeId?: string;
};

profile.patch("/", async (c) => {
  const session = await authenticate(c);

  await connect();

  const data = await c.req.json<BodyT>();
  const allowedFields: string[] = ["name", "exceptions", "dismissedNoticeId"];
  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key) || !data[key as keyof BodyT]) {
      delete data[key as keyof BodyT];
    }
  });

  if (typeof data.name === "string") {
    data.name = data.name.trim();
    if (!data.name) delete data.name;
  }

  await User.updateOne({ _id: session.userId }, data);

  if (data.name) {
    await Participant.updateMany({ userId: session.userId }, { $set: { name: data.name } });
  }

  return c.json({});
});

profile.put("/lifelist", async (c) => {
  const session = await authenticate(c);

  await connect();

  const { sciNames } = await c.req.json<LifelistImportInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);

  await User.updateOne({ _id: session.userId }, { $set: { lifelist: codes, lifelistUpdatedAt: new Date() } });

  return c.json({});
});

profile.post("/lifelist/add", async (c) => {
  const session = await authenticate(c);

  await connect();

  const { code } = await c.req.json<AddToLifelistInput>();
  if (!code) throw new HTTPException(400, { message: "Missing code" });

  await User.updateOne(
    { _id: session.userId },
    { $addToSet: { lifelist: code }, $pull: { exceptions: code }, $set: { lifelistUpdatedAt: new Date() } },
  );

  return c.json({});
});

export default profile;
