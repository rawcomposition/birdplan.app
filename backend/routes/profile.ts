import { Hono } from "hono";
import { authenticate } from "lib/utils.js";
import { connect, Profile } from "lib/db.js";
import { HTTPException } from "hono/http-exception";

const profile = new Hono();

profile.get("/", async (c) => {
  const session = await authenticate(c);

  await connect();
  let [profile] = await Promise.all([
    Profile.findOne({ uid: session.uid }).lean(),
    Profile.updateOne({ uid: session.uid }, { lastActiveAt: new Date() }),
  ]);

  if (!profile) {
    const newProfile = await Profile.create({
      uid: session.uid,
      name: session.name,
      email: session.email,
    });
    profile = newProfile.toObject();
  }

  if (!profile.name && session.name) {
    await Profile.updateOne({ uid: session.uid }, { name: session.name });
    profile = { ...profile, name: session.name };
  }

  return c.json(profile);
});

type BodyT = {
  lifelist?: string[];
  exceptions?: string[];
  dismissedNoticeId?: string;
};

type eBirdResponse = {
  speciesCode: string;
  sciName: string;
}[];

profile.patch("/", async (c) => {
  const session = await authenticate(c);

  await connect();

  const data = await c.req.json<BodyT>();
  const allowedFields: string[] = ["lifelist", "exceptions", "dismissedNoticeId"];
  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key) || !data[key as keyof BodyT]) {
      delete data[key as keyof BodyT];
    }
  });

  if (data.lifelist) {
    const sciNames = data.lifelist;
    const response = await fetch(
      `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species&key=${process.env.EBIRD_API_KEY}`
    );
    const taxonomy: eBirdResponse = await response.json();

    const codes = sciNames
      .map((name: string) => {
        return taxonomy.find((taxon) => taxon.sciName === name)?.speciesCode;
      })
      .filter((code) => code);

    await Profile.updateOne({ uid: session.uid }, { ...data, lifelist: codes });
  } else {
    await Profile.updateOne({ uid: session.uid }, data);
  }

  return c.json({});
});

profile.post("/add-to-lifelist", async (c) => {
  const session = await authenticate(c);
  await connect();

  const data = await c.req.json<{ code: string }>();
  const { code } = data;

  await Profile.updateOne({ uid: session.uid }, { $addToSet: { lifelist: code }, $pull: { exclusions: code } });
  return c.json({});
});

export default profile;
