import React from "react";
import { useProfile } from "providers/profile";

/**
 * The effective life list a trip targets against: its custom list when one is set,
 * otherwise the user's global list — both with the global exceptions overlay removed.
 *
 * `lifelist` from the profile provider is already exception-filtered, so the no-custom
 * path needs no further work. The custom path filters once, memoized, to avoid re-running
 * an O(n) pass over potentially thousands of codes on every render.
 */
export default function useTripLifelist(customLifelist?: string[] | null): string[] {
  const { lifelist, exceptions } = useProfile();

  return React.useMemo(() => {
    if (!customLifelist) return lifelist;
    const ex = new Set(exceptions || []);
    return customLifelist.filter((code) => !ex.has(code));
  }, [customLifelist, lifelist, exceptions]);
}
