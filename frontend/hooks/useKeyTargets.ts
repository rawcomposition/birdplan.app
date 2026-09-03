import dayjs from "dayjs";
import { useTrip } from "hooks/useTrip";
import useTripLifelist from "hooks/useTripLifelist";
import useHotspotTargets from "hooks/useHotspotTargets";
import { HOTSPOT_TARGET_CUTOFF } from "lib/config";
import { getTripDays } from "lib/itinerary";
import { bestHotspotsByCode, getMonthRange } from "lib/targets";

export type KeyTarget = {
  code: string;
  name: string;
  frequency: number;
  hotspotNames: string[];
};

export default function useKeyTargets() {
  const { trip } = useTrip();
  const { lifelist } = useTripLifelist(trip);

  const days = getTripDays(trip);
  const savedIds = new Set(trip?.hotspots.map((it) => it.id) ?? []);
  const scheduledByDay = days.map((day) =>
    (day.locations || []).flatMap((it) =>
      it.type === "hotspot" && savedIds.has(it.locationId) ? [it.locationId] : []
    )
  );
  const poolIds = [...new Set(scheduledByDay.flat())];

  const { hotspots, namesByCode, isLoading } = useHotspotTargets(poolIds, poolIds.length > 1);

  const tripMonths = getMonthRange(trip?.startMonth || 1, trip?.endMonth || 12);
  const monthsByDay = days.map((_, index) =>
    trip?.startDate ? [dayjs(trip.startDate).add(index, "day").month() + 1] : tripMonths
  );
  const bestByMonthKey = new Map(
    [...new Set(monthsByDay.map((it) => it.join(",")))].map((key) => [
      key,
      bestHotspotsByCode(hotspots, key.split(",").map(Number)),
    ])
  );

  const hotspotNameById = new Map(trip?.hotspots.map((it) => [it.id, it.name]) ?? []);
  const seen = new Set(lifelist);

  const targetsByDay = new Map<string, KeyTarget[]>(
    days.map((day, index) => {
      const dayIds = new Set(scheduledByDay[index]);
      const best = bestByMonthKey.get(monthsByDay[index].join(","));
      const targets: KeyTarget[] = [];

      for (const [code, { hotspotIds, frequency }] of best ?? []) {
        if (frequency < HOTSPOT_TARGET_CUTOFF || seen.has(code)) continue;
        const here = hotspotIds.filter((it) => dayIds.has(it));
        if (!here.length) continue;
        targets.push({
          code,
          name: namesByCode.get(code) || code,
          frequency,
          hotspotNames: here.flatMap((it) => hotspotNameById.get(it) ?? []),
        });
      }

      return [day.id, targets.sort((a, b) => b.frequency - a.frequency)];
    })
  );

  return { targetsByDay, isLoading };
}
