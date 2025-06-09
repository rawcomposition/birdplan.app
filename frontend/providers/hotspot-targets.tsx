import React from "react";
import { useTrip } from "providers/trip";
import { TargetList } from "lib/types";
import useTargetsDownloadManager from "hooks/useTargetsDownloadManager";
import { useQuery } from "@tanstack/react-query";

type ContextT = {
  failedLocIds: string[];
  pendingLocIds: string[];
  retryDownload: (locId: string) => void;
};

const initialState = {
  failedLocIds: [],
  pendingLocIds: [],
  retryDownload: () => {},
};

export const HotspotTargetsContext = React.createContext<ContextT>({
  ...initialState,
});

type Props = {
  children: React.ReactNode;
};

const HotspotTargetsProvider = ({ children }: Props) => {
  const { pendingLocIds, failedLocIds, retryDownload } = useTargetsDownloadManager();

  return (
    <HotspotTargetsContext.Provider
      value={{
        pendingLocIds,
        failedLocIds,
        retryDownload,
      }}
    >
      {children}
    </HotspotTargetsContext.Provider>
  );
};

const cleanTargets = (targets: TargetList[]) => {
  const encounteredIds = new Set<string>();
  return targets.filter((target) => {
    if (!target.hotspotId) return false;
    if (encounteredIds.has(target.hotspotId)) return false;
    encounteredIds.add(target.hotspotId);
    return true;
  });
};

const useHotspotTargets = () => {
  const { trip } = useTrip();
  const state = React.useContext(HotspotTargetsContext);

  const tripId = trip?._id;

  const { data } = useQuery<TargetList[]>({
    queryKey: [`/api/v1/trips/${tripId}/all-hotspot-targets`],
    enabled: !!tripId,
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });

  const targets = cleanTargets(data || []);

  return { ...state, allTargets: targets };
};

export { HotspotTargetsProvider, useHotspotTargets };
