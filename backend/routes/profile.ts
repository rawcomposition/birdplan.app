import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile } from "lib/db.js";
import { sciNamesToCodes } from "lib/taxonomy.js";
import { auth } from "lib/firebaseAdmin.js";
import { HTTPException } from "hono/http-exception";
import type { LifelistImportInput, AddToLifelistInput } from "@birdplan/shared";

const profile = new Hono();

profile.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  const set: Record<string, string | Date> = { lastActiveAt: new Date() };
  const tokenName = typeof session.name === "string" && session.name.trim() ? session.name : null;
  const tokenEmail = typeof session.email === "string" && session.email.trim() ? session.email.toLowerCase() : null;
  const tokenPhotoUrl = typeof session.picture === "string" && session.picture.trim() ? session.picture : null;

  if (tokenName) set.name = tokenName;
  if (tokenEmail) set.email = tokenEmail;
  if (tokenPhotoUrl) set.photoUrl = tokenPhotoUrl;

  if (!tokenName) {
    const existing = await Profile.findOne({ uid: session.uid }).select("name").lean();
    if (!existing?.name) {
      const user = await auth?.getUser(session.uid);
      if (user?.displayName) set.name = user.displayName;
    }
  }

  const profile = await Profile.findOneAndUpdate(
    { uid: session.uid },
    {
      $set: set,
      $setOnInsert: { uid: session.uid },
    },
    { upsert: true, new: true }
  ).lean();
  if (!profile) throw new HTTPException(500, { message: "Profile not found" });

  return c.json(profile);
});

type BodyT = {
  exceptions?: string[];
  dismissedNoticeId?: string;
};

profile.patch("/", async (c) => {
  const session = await authenticate(c);

  await connect();

  const data = await c.req.json<BodyT>();
  const allowedFields: string[] = ["exceptions", "dismissedNoticeId"];
  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key) || !data[key as keyof BodyT]) {
      delete data[key as keyof BodyT];
    }
  });

  await Profile.updateOne({ uid: session.uid }, data);

  return c.json({});
});

profile.put("/lifelist", async (c) => {
  const session = await authenticate(c);

  await connect();

  const { sciNames } = await c.req.json<LifelistImportInput>();
  if (!Array.isArray(sciNames)) throw new HTTPException(400, { message: "Missing sciNames" });

  const codes = await sciNamesToCodes(sciNames);

  await Profile.updateOne({ uid: session.uid }, { $set: { lifelist: codes, lifelistUpdatedAt: new Date() } });

  return c.json({});
});

profile.post("/lifelist/add", async (c) => {
  const session = await authenticate(c);

  await connect();

  const { code } = await c.req.json<AddToLifelistInput>();
  if (!code) throw new HTTPException(400, { message: "Missing code" });

  await Profile.updateOne(
    { uid: session.uid },
    { $addToSet: { lifelist: code }, $pull: { exceptions: code }, $set: { lifelistUpdatedAt: new Date() } },
  );

  return c.json({});
});

export default profile;
