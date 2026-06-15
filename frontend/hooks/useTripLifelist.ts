import React from "react";
import { Trip, IntersectionList } from "@birdplan/shared";
import { useProfile } from "providers/profile";

export type TripLifelistMode = "world" | "customSingle" | "customShared";

export type TripLifelist = {
  /** The effective life list this trip targets against (global exceptions removed). */
  codes: string[];
  /** Which kind of list is in effect. All "which list?" logic lives here, not in consumers. */
  mode: TripLifelistMode;
  /** Number of species on the effective list. */
  count: number;
  /** The named source lists backing "shared" mode; empty otherwise. */
  intersectionLists: IntersectionList[];
};

/**
 * Single source of truth for a trip's effective life list and which mode it's in.
 *
 * - world: the user's global list (already exception-filtered by the profile provider)
 * - customSingle: a single uploaded list for this trip
 * - customShared: the intersection of several named lists (stored in customLifelist)
 *
 * Both custom modes read from `trip.customLifelist`; the intersection is precomputed
 * server-side, so resolution is identical. Adding a future list type only touches this hook.
 */
export default function useTripLifelist(trip?: Trip | null): TripLifelist {
  const { lifelist, exceptions } = useProfile();

  const intersectionLists = trip?.intersectionLists ?? [];
  const customLifelist = trip?.customLifelist ?? null;
  const mode: TripLifelistMode =
    intersectionLists.length > 0 ? "customShared" : customLifelist != null ? "customSingle" : "world";

  // The custom path filters once, memoized, to avoid an O(n) pass over thousands of codes
  // on every render. The global path is already exception-filtered upstream.
  const codes = React.useMemo(() => {
    if (!customLifelist) return lifelist;
    const ex = new Set(exceptions || []);
    return customLifelist.filter((code) => !ex.has(code));
  }, [customLifelist, lifelist, exceptions]);

  return { codes, mode, count: codes.length, intersectionLists };
}
