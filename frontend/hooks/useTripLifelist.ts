import { Trip } from "@birdplan/shared";
import { useProfile } from "providers/profile";

export type TripLifelist = {
  lifelist: string[];
  myLifelist: string[];
  isGroup: boolean;
  count: number;
};

function filterExceptions(list: string[], exceptions?: string[]): string[] {
  if (!exceptions?.length) return list;
  const ex = new Set(exceptions);
  return list.filter((code) => !ex.has(code));
}

export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist: worldLifelist, exceptions } = useProfile();

  const worldFiltered = filterExceptions(worldLifelist || [], exceptions);
  const lifelist = trip?.groupLifelist ?? trip?.tripLifelist ?? trip?.viewerLifelist ?? worldFiltered;
  const myLifelist = trip?.viewer?.listMode === "custom" ? trip?.viewerLifelist ?? worldFiltered : worldFiltered;
  const isGroup = trip?.isGroupTrip ?? false;

  return { lifelist, myLifelist, isGroup, count: lifelist.length };
}
