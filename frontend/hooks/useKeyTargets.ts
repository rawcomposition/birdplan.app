import dayjs from "dayjs";
import { useTrip } from "hooks/useTrip";
import useTripLifelist from "hooks/useTripLifelist";
import useHotspotTargets from "hooks/useHotspotTargets";
import { getTripDays } from "lib/itinerary";
import { getDayTargetOpportunities, getKeySpeciesOpportunities, getMonthRange } from "lib/targets";

export type KeyTarget = {
  code: string;
  name: string;
  frequency: number;
  hardToFindElsewhere: boolean;
  materiallyBetterToday: boolean;
};

export type KeyTargetGroup = {
  hotspotId: string;
  hotspotName: string;
  targets: KeyTarget[];
};

export default function useKeyTargets() {
  const { trip } = useTrip();
  const { lifelist } = useTripLifelist(trip);
  const days = getTripDays(trip);
  const savedIds = new Set(trip?.hotspots.map((it) => it.id) ?? []);
  const scheduledByDay = days.map((day) =>
    [...new Set((day.locations || []).flatMap((it) => (it.type === "hotspot" && savedIds.has(it.locationId) ? [it.locationId] : [])))]
  );
  const poolIds = [...new Set(scheduledByDay.flat())];
  const { hotspots, namesByCode, isLoading } = useHotspotTargets(poolIds, poolIds.length > 0);
  const tripMonths = getMonthRange(trip?.startMonth || 1, trip?.endMonth || 12);
  const monthsByDay = days.map((_, index) =>
    trip?.startDate ? [dayjs(trip.startDate).add(index, "day").month() + 1] : tripMonths
  );
  const hotspotsById = new Map(hotspots.map((hotspot) => [hotspot.hotspotId, hotspot]));
  const opportunitiesByDay = scheduledByDay.map((hotspotIds, index) =>
    getDayTargetOpportunities(hotspotsById, hotspotIds, monthsByDay[index])
  );
  const keySpeciesByDay = getKeySpeciesOpportunities(opportunitiesByDay);
  const hotspotNameById = new Map(trip?.hotspots.map((it) => [it.id, it.name]) ?? []);
  const seen = new Set(lifelist);

  const groupsByDay = new Map<string, KeyTargetGroup[]>(
    days.map((day, index) => {
      const dayIds = scheduledByDay[index];
      const keySpecies = keySpeciesByDay.get(index);
      const byHotspot = new Map<string, KeyTarget[]>();

      for (const [code, opportunity] of keySpecies ?? []) {
        if (seen.has(code)) continue;
        const { frequency, hotspotIds, hardToFindElsewhere, materiallyBetterToday } = opportunity;
        for (const hotspotId of hotspotIds) {
          const targets = byHotspot.get(hotspotId) || [];
          targets.push({ code, name: namesByCode.get(code) || code, frequency, hardToFindElsewhere, materiallyBetterToday });
          byHotspot.set(hotspotId, targets);
        }
      }

      const groups = dayIds.flatMap((hotspotId) => {
        const targets = byHotspot.get(hotspotId);
        if (!targets?.length) return [];
        return [{ hotspotId, hotspotName: hotspotNameById.get(hotspotId) || "Unknown Location", targets: targets.sort((a, b) => b.frequency - a.frequency) }];
      });

      return [day.id, groups];
    })
  );

  return { groupsByDay, isLoading };
}
