import { Trip } from "@birdplan/shared";
import { TargetPeriod, useTargetPreferencesStore } from "stores/targetPreferences";

export default function useTargetPeriod(trip?: Trip | null) {
  const tripId = trip?._id;
  const stored = useTargetPreferencesStore((state) => (tripId ? state.periodByTrip[tripId] : undefined));
  const setStored = useTargetPreferencesStore((state) => state.setPeriod);
  const period: TargetPeriod = stored ?? "trip";
  const setPeriod = (next: TargetPeriod) => tripId && setStored(tripId, next);

  return { period, setPeriod };
}
