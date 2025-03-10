import { APIError } from "lib/api";
import { connect, Trip, TargetList, Profile } from "lib/db";
import { TargetListType } from "lib/types";
import { tripToGeoJson, sanitizeFileName } from "lib/helpers";
// @ts-ignore
import * as tokml from "@maphubs/tokml";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    await connect();
    const [trip, hotspotTargets, profile] = await Promise.all([
      Trip.findById(id).lean(),
      TargetList.find({ tripId: id, type: TargetListType.hotspot }).lean(),
      Profile.findById(uid).lean(),
    ]);
    if (!trip) return APIError("Trip not found", 404);

    const lifelist = profile?.lifelist || [];

    const filteredTargets = hotspotTargets.map((target) => {
      const needs = target.items?.filter((it) => !lifelist?.includes(it.code));
      const filtered = needs?.filter((it) => it.percentYr >= 5);
      const items = filtered?.sort((a, b) => b.percentYr - a.percentYr);
      return { ...target, items };
    });

    const geoJson = tripToGeoJson(trip, filteredTargets);
    const kml = tokml(geoJson);

    const headers = new Headers({
      "Content-Type": "application/vnd.google-earth.kml+xml",
      "Content-Disposition": `attachment; filename="${sanitizeFileName(trip.name)}.kml"`,
    });

    return new Response(kml, { status: 200, headers });
  } catch (error: unknown) {
    return APIError(error instanceof Error ? error.message : "Error updating trip", 500);
  }
}
