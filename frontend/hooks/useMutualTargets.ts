import React from "react";
import { Trip } from "@birdplan/shared";

export type MutualTargets = {
  isGroup: boolean;
  isMutual: (code: string) => boolean;
};

export default function useMutualTargets(trip?: Trip | null): MutualTargets {
  const isGroup = trip?.isGroupTrip ?? false;
  const union = trip?.unionLifelist;
  const unionSet = React.useMemo(() => (union ? new Set(union) : null), [union]);
  const isMutual = (code: string) => isGroup && !!unionSet && !unionSet.has(code);

  return { isGroup, isMutual };
}
