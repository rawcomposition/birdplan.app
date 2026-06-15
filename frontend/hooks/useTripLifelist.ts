import { Trip, TripLifelistMode } from "@birdplan/shared";
import { useProfile } from "providers/profile";

export type { TripLifelistMode };

export type TripLifelist = {
  /** The GROUP's effective list — what targets render against (exceptions already removed). */
  codes: string[];
  /** The viewer's OWN effective list — what `isSeen` / mark-seen key off. */
  myCodes: string[];
  /** The group's mode. */
  mode: TripLifelistMode;
  /** Number of species on the group list. */
  count: number;
};

function filterExceptions(list: string[], exceptions?: string[]): string[] {
  if (!exceptions?.length) return list;
  const ex = new Set(exceptions);
  return list.filter((code) => !ex.has(code));
}

/**
 * Single source of truth for a trip's effective life lists. The server resolves both the group
 * intersection (`trip.customLifelist`) and the viewer's own list (`trip.viewerLifelist`); we only
 * fall back to — and exception-filter — the live global list when the trip hasn't supplied one.
 *
 * - `codes` (group) drives the targets/hotspot lists.
 * - `myCodes` (viewer) drives `isSeen`. A World viewer reads the live global list so optimistic
 *   mark-seen updates show immediately; a Custom viewer reads their server-resolved trip list.
 */
export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist, exceptions } = useProfile();

  const globalFiltered = filterExceptions(lifelist || [], exceptions);
  const codes = trip?.customLifelist ?? globalFiltered;
  const myCodes = trip?.viewer?.listMode === "custom" ? trip?.viewerLifelist ?? globalFiltered : globalFiltered;
  const mode = trip?.lifelistMode ?? "world";

  return { codes, myCodes, mode, count: codes.length };
}
