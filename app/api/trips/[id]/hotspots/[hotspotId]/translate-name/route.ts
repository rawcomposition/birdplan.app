import { authenticate, APIError } from "lib/api";
import { connect, Trip } from "lib/db";
import * as deepl from "deepl-node";

type ParamsT = { id: string; hotspotId: string };

export async function PATCH(request: Request, { params }: { params: ParamsT }) {
  try {
    const { id, hotspotId } = await params;
    const session = await authenticate(request);
    if (!session?.uid) return APIError("Unauthorized", 401);

    await connect();
    const trip = await Trip.findById(id).lean();
    if (!trip) return APIError("Trip not found", 404);
    if (!trip.userIds.includes(session.uid)) return APIError("Forbidden", 403);

    const hotspot = trip.hotspots.find((it) => it.id === hotspotId);
    if (!hotspot) return APIError("Hotspot not found", 404);

    const originalName = hotspot.name;
    if (!originalName) return Response.json({ originalName, translatedName: "" });

    const authKey = process.env.DEEPL_KEY || "";
    const translator = new deepl.Translator(authKey);

    //@ts-ignore
    const response = await translator.translateText(hotspot.name, null, "EN-US");
    //@ts-ignore
    const translatedName = response.text || "";

    if (translatedName === originalName || !translatedName) return Response.json({ originalName, translatedName: "" });

    await Trip.updateOne(
      { _id: id, "hotspots.id": hotspotId },
      { $set: { "hotspots.$.name": translatedName, "hotspots.$.originalName": originalName } }
    );

    return Response.json({ originalName, translatedName });
  } catch (error: any) {
    return APIError(error?.message || "Error translating", 500);
  }
}
