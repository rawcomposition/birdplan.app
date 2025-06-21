import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { authenticate } from "lib/utils.js";
import { connect, Trip, TargetList } from "lib/db.js";
import type {
  HotspotInput,
  HotspotNotesInput,
  TargetListInput,
  HotspotFav,
  SpeciesFavInput,
  TranslateNameResponse,
} from "@birdplan/shared";
import { TargetListType } from "@birdplan/shared";
import * as deepl from "deepl-node";
import axios from "axios";
import dayjs from "dayjs";

const hotspots = new Hono();

hotspots.post("/", async (c) => {
  const data = await c.req.json<HotspotInput>();
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  if (trip.hotspots.find((it) => it.id === data.id)) return c.json({});

  await Trip.updateOne({ _id: tripId }, { $push: { hotspots: data } });
  return c.json({});
});

hotspots.delete("/:hotspotId", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Promise.all([
    Trip.updateOne({ _id: tripId }, { $pull: { hotspots: { id: hotspotId } } }),
    TargetList.deleteMany({ tripId, hotspotId }),
  ]);
  return c.json({});
});

hotspots.patch("/:hotspotId/reset-targets", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  await Promise.all([
    Trip.updateOne({ _id: tripId, "hotspots.id": hotspotId }, { $unset: { "hotspots.$.targetsId": "" } }),
    TargetList.deleteMany({ tripId, hotspotId }),
  ]);

  return c.json({});
});

hotspots.get("/:hotspotId/targets", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const [trip, targetList] = await Promise.all([
    Trip.findById(tripId),
    TargetList.findOne({ type: TargetListType.hotspot, tripId, hotspotId }).sort({ createdAt: -1 }),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.isPublic && (!session?.uid || !trip.userIds.includes(session.uid)))
    throw new HTTPException(403, { message: "Forbidden" });

  return c.json(targetList || null);
});

hotspots.patch("/:hotspotId/targets", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const data = await c.req.json<TargetListInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  if (!data.hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });
  const targetList = await TargetList.findOneAndUpdate(
    { type: TargetListType.hotspot, tripId, hotspotId: data.hotspotId },
    {
      ...data,
      type: TargetListType.hotspot,
      tripId,
      hotspotId: data.hotspotId,
    },
    { upsert: true, new: true }
  );
  if (targetList._id) {
    await Trip.updateOne(
      { _id: tripId, "hotspots.id": data.hotspotId },
      { $set: { "hotspots.$.targetsId": targetList._id } }
    );
  }
  return c.json({ id: targetList._id });
});

hotspots.patch("/:hotspotId/translate-name", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  const originalName = hotspot.name;
  if (!originalName) return c.json<TranslateNameResponse>({ originalName, translatedName: "" });

  const authKey = process.env.DEEPL_KEY || "";
  const translator = new deepl.Translator(authKey);

  const response = await translator.translateText(hotspot.name, null, "en-US");
  const translatedName = response.text || "";

  if (translatedName === originalName || !translatedName) {
    return c.json<TranslateNameResponse>({ originalName, translatedName: "" });
  }

  await Trip.updateOne(
    { _id: tripId, "hotspots.id": hotspotId },
    { $set: { "hotspots.$.name": translatedName, "hotspots.$.originalName": originalName } }
  );

  return c.json<TranslateNameResponse>({ originalName, translatedName });
});

hotspots.post("/:hotspotId/add-species-fav", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<HotspotFav>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  if (hotspot.favs?.find((it) => it.code === data.code)) return c.json({});

  await Trip.updateOne({ _id: tripId, "hotspots.id": hotspotId }, { $push: { "hotspots.$.favs": data } });

  return c.json({});
});

hotspots.get("/:hotspotId/info", async (c) => {
  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const response = await fetch(`https://ebird.org/mapServices/getHsInfo.do?fmt=json&hs=${hotspotId}&yr=all&m=`);
  const json = await response.json();

  const thirtyDays = 2592000;

  c.header("Cache-Control", `public, max-age=${thirtyDays}, s-maxage=${thirtyDays}`);

  return c.json(json);
});

hotspots.patch("/:hotspotId/notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<HotspotNotesInput>();

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId, "hotspots.id": hotspotId }, { $set: { "hotspots.$.notes": data.notes } });

  return c.json({});
});

hotspots.get("/:hotspotId/obs", async (c) => {
  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const speciesCode = c.req.query("speciesCode");

  const year = dayjs().year();
  const url = `https://ebird.org/mapServices/getLocInfo.do?fmt=json&locID=${hotspotId}&speciesCodes=${speciesCode}&evidSort=false&excludeExX=false&excludeExAll=false&byr=1900&eyr=${year}&yr=all&bmo=1&emo=12`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
    maxRedirects: 2,
  });

  const formatted = response.data.infoList.map((info: any) => {
    return {
      checklistId: info.subID,
      count: info.howMany,
      date: info.obsDt,
      evidence: info.evidence,
    };
  });

  const oneHour = 60 * 60;

  c.header("Cache-Control", `public, max-age=${oneHour}, s-maxage=${oneHour}`);

  return c.json(formatted);
});

hotspots.patch("/:hotspotId/remove-species-fav", async (c) => {
  const data = await c.req.json<SpeciesFavInput>();
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  await Trip.updateOne(
    { _id: tripId, "hotspots.id": hotspotId },
    { $pull: { "hotspots.$.favs": { code: data.code } } }
  );

  return c.json({});
});

hotspots.patch("/:hotspotId/reset-name", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const trip = await Trip.findById(tripId).lean();
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!trip.userIds.includes(session.uid)) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  await Trip.updateOne(
    { _id: tripId, "hotspots.id": hotspotId },
    { $set: { "hotspots.$.name": hotspot.originalName, "hotspots.$.originalName": "" } }
  );

  return c.json({});
});

export default hotspots;
