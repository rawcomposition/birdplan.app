import { Trip } from "@birdplan/shared";
import { TargetCoverage, useTargetPreferencesStore } from "stores/targetPreferences";

export default function useTargetCoverage(trip?: Trip | null) {
  const tripId = trip?._id;
  const stored = useTargetPreferencesStore((state) => (tripId ? state.coverageByTrip[tripId] : undefined));
  const setStored = useTargetPreferencesStore((state) => state.setCoverage);
  const coverage: TargetCoverage = stored ?? "region";
  const setCoverage = (next: TargetCoverage) => tripId && setStored(tripId, next);

  return { coverage, setCoverage };
}
