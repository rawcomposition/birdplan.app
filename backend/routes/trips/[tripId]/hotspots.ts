import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AnyBulkWriteOperation, UpdateQuery } from "mongoose";
import { authenticate, nanoId } from "lib/utils.js";
import { connect, Trip, SavedHotspot, Label } from "lib/db.js";
import { isTripEditor, loadEditableTrip } from "lib/participants.js";
import { fetchHotspotsInRegion } from "lib/openbirding.js";
import type {
  HotspotInput,
  HotspotLabelsInput,
  HotspotNotesInput,
  HotspotFav,
  HotspotSyncInput,
  SpeciesFavInput,
  TranslateNameResponse,
  TripImportInput,
  TripImportResponse,
  TripLabel,
  Trip as TripT,
} from "@birdplan/shared";
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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  if (trip.hotspots.find((it) => it.id === data.id)) return c.json({});

  await Trip.updateOne({ _id: tripId }, { $push: { hotspots: data } });
  return c.json({});
});

hotspots.post("/import", async (c) => {
  const session = await authenticate(c);
  const data = await c.req.json<TripImportInput>();
  if (!Array.isArray(data.hotspotIds)) throw new HTTPException(400, { message: "Hotspot IDs are required" });

  const trip = await loadEditableTrip(c.req.param("tripId"), session.userId);
  const existingIds = new Set(trip.hotspots.map((it) => it.id));
  const candidateIds = [...new Set(data.hotspotIds.filter((id): id is string => typeof id === "string" && !!id))].filter(
    (id) => !existingIds.has(id)
  );
  const lookup = await fetchHotspotsInRegion(candidateIds, trip.region);
  const incoming: HotspotInput[] = lookup.map((it) => ({
    id: it.id,
    name: it.name,
    lat: it.lat,
    lng: it.lng,
    species: it.numSpecies ?? 0,
    checklists: it.numChecklists ?? 0,
  }));
  if (incoming.length === 0) return c.json<TripImportResponse>({ added: 0 });

  const includeNotes = !!data.includeNotes;
  const includeLabels = !!data.includeLabels;
  const savedRows =
    includeNotes || includeLabels
      ? await SavedHotspot.find({ userId: session.userId, hotspotId: { $in: incoming.map((it) => it.id) } }).lean()
      : [];
  const savedById = new Map(savedRows.map((it) => [it.hotspotId, it]));

  const newLabels: TripLabel[] = [];
  const tripLabelIdByUserLabelId = new Map<string, string>();
  if (includeLabels) {
    const userLabelIds = [...new Set(savedRows.flatMap((it) => it.labelIds || []))];
    const userLabels = userLabelIds.length ? await Label.find({ userId: session.userId, _id: { $in: userLabelIds } }).lean() : [];
    const tripLabels = [...(trip.labels || [])];
    for (const userLabel of userLabels) {
      const match = tripLabels.find((it) => it.name.toLowerCase() === userLabel.name.toLowerCase());
      if (match) {
        tripLabelIdByUserLabelId.set(userLabel._id, match._id);
        continue;
      }
      const label: TripLabel = { _id: nanoId(), name: userLabel.name, color: userLabel.color };
      tripLabels.push(label);
      newLabels.push(label);
      tripLabelIdByUserLabelId.set(userLabel._id, label._id);
    }
  }

  const hotspotsToAdd = incoming.map((it) => {
    const saved = savedById.get(it.id);
    const labelIds = (saved?.labelIds || [])
      .map((id) => tripLabelIdByUserLabelId.get(id))
      .filter((id): id is string => !!id);
    return {
      ...it,
      ...(includeNotes && saved?.notes ? { notes: saved.notes } : {}),
      ...(includeLabels && labelIds.length ? { labelIds } : {}),
    };
  });

  await Trip.updateOne(
    { _id: trip._id },
    {
      $push: {
        hotspots: { $each: hotspotsToAdd },
        ...(newLabels.length ? { labels: { $each: newLabels } } : {}),
      },
    }
  );
  return c.json<TripImportResponse>({ added: hotspotsToAdd.length });
});

hotspots.put("/:hotspotId/labels", async (c) => {
  const session = await authenticate(c);
  const hotspotId = c.req.param("hotspotId");
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<HotspotLabelsInput>();
  if (!Array.isArray(data.labelIds)) throw new HTTPException(400, { message: "Label IDs are required" });

  const trip = await loadEditableTrip(c.req.param("tripId"), session.userId);
  if (!trip.hotspots.some((it) => it.id === hotspotId)) throw new HTTPException(404, { message: "Hotspot not found" });

  const tripLabelIds = new Set((trip.labels || []).map((it) => it._id));
  const labelIds = [...new Set(data.labelIds.filter((id): id is string => typeof id === "string" && tripLabelIds.has(id)))];

  await Trip.updateOne({ _id: trip._id, "hotspots.id": hotspotId }, { $set: { "hotspots.$.labelIds": labelIds } });
  return c.json({});
});

hotspots.delete("/:hotspotId", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  await Trip.updateOne({ _id: tripId }, { $pull: { hotspots: { id: hotspotId } } });
  return c.json({});
});

hotspots.patch("/:hotspotId/translate-name", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  if (hotspot.favs?.find((it) => it.code === data.code)) return c.json({});

  await Trip.updateOne({ _id: tripId, "hotspots.id": hotspotId }, { $push: { "hotspots.$.favs": data } });

  return c.json({});
});

hotspots.patch("/sync", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });

  const { updates } = await c.req.json<HotspotSyncInput>();
  if (!Array.isArray(updates) || updates.length === 0) return c.json({});

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const now = new Date();
  const ops: AnyBulkWriteOperation<TripT>[] = updates.map((u) => {
    const $set: Record<string, unknown> = {};
    if (Number.isFinite(u.species)) $set["hotspots.$.species"] = u.species;
    if (Number.isFinite(u.checklists)) $set["hotspots.$.checklists"] = u.checklists;
    if (Number.isFinite(u.lat)) $set["hotspots.$.lat"] = u.lat;
    if (Number.isFinite(u.lng)) $set["hotspots.$.lng"] = u.lng;
    if (typeof u.name === "string" && u.name.length > 0) $set["hotspots.$.name"] = u.name;
    const filter = u.deleted
      ? { _id: tripId, hotspots: { $elemMatch: { id: u.id, deletedAt: null } } }
      : { _id: tripId, "hotspots.id": u.id };
    const update: UpdateQuery<TripT> = u.deleted
      ? { $set: { ...$set, "hotspots.$.deletedAt": now } }
      : { ...(Object.keys($set).length ? { $set } : {}), $unset: { "hotspots.$.deletedAt": true } };
    return { updateOne: { filter, update } };
  });
  await Trip.bulkWrite(ops);

  return c.json({});
});

hotspots.patch("/:hotspotId/notes", async (c) => {
  const session = await authenticate(c);

  const tripId = c.req.param("tripId");
  const hotspotId = c.req.param("hotspotId");
  if (!tripId) throw new HTTPException(400, { message: "Trip ID is required" });
  if (!hotspotId) throw new HTTPException(400, { message: "Hotspot ID is required" });

  const data = await c.req.json<HotspotNotesInput>();

  await connect();
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

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
  const [trip, isEditor] = await Promise.all([
    Trip.findById(tripId).lean(),
    isTripEditor(tripId, session.userId),
  ]);
  if (!trip) throw new HTTPException(404, { message: "Trip not found" });
  if (!isEditor) throw new HTTPException(403, { message: "Forbidden" });

  const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
  if (!hotspot) throw new HTTPException(404, { message: "Hotspot not found" });

  await Trip.updateOne(
    { _id: tripId, "hotspots.id": hotspotId },
    { $set: { "hotspots.$.name": hotspot.originalName, "hotspots.$.originalName": "" } }
  );

  return c.json({});
});

export default hotspots;
