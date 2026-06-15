import { Trip, TripLifelistMode } from "@birdplan/shared";
import { useProfile } from "providers/profile";

export type { TripLifelistMode };

export type TripLifelist = {
  codes: string[];
  myCodes: string[];
  mode: TripLifelistMode;
  count: number;
};

function filterExceptions(list: string[], exceptions?: string[]): string[] {
  if (!exceptions?.length) return list;
  const ex = new Set(exceptions);
  return list.filter((code) => !ex.has(code));
}

export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist, exceptions } = useProfile();

  const globalFiltered = filterExceptions(lifelist || [], exceptions);
  const codes = trip?.customLifelist ?? globalFiltered;
  const myCodes = trip?.viewer?.listMode === "custom" ? trip?.viewerLifelist ?? globalFiltered : globalFiltered;
  const mode = trip?.lifelistMode ?? "world";

  return { codes, myCodes, mode, count: codes.length };
}
