import { Trip, TripLifelistMode } from "@birdplan/shared";
import { useProfile } from "providers/profile";

export type { TripLifelistMode };

export type TripLifelist = {
  lifelist: string[];
  myLifelist: string[];
  mode: TripLifelistMode;
  count: number;
};

function filterExceptions(list: string[], exceptions?: string[]): string[] {
  if (!exceptions?.length) return list;
  const ex = new Set(exceptions);
  return list.filter((code) => !ex.has(code));
}

export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist: globalLifelist, exceptions } = useProfile();

  const globalFiltered = filterExceptions(globalLifelist || [], exceptions);
  const lifelist = trip?.customLifelist ?? globalFiltered;
  const myLifelist = trip?.viewer?.listMode === "custom" ? trip?.viewerLifelist ?? globalFiltered : globalFiltered;
  const mode = trip?.lifelistMode ?? "world";

  return { lifelist, myLifelist, mode, count: lifelist.length };
}
