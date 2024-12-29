import React from "react";
import { useTrip } from "providers/trip";
import { Targets } from "lib/types";
import { updateHotspots, subscribeToHotspotTargets, deleteTargets } from "lib/firebase";

import useTargetsDownloadManager from "hooks/useTargetsDownloadManager";

type ContextT = {
  failedLocIds: string[];
  pendingLocIds: string[];
  retryDownload: (locId: string) => void;
  resetAttempts: (locId: string) => void;
};

const initialState = {
  failedLocIds: [],
  pendingLocIds: [],
  retryDownload: () => {},
  resetAttempts: () => {},
};

export const HotspotTargetsContext = React.createContext<ContextT>({
  ...initialState,
});

type Props = {
  children: React.ReactNode;
};

const HotspotTargetsProvider = ({ children }: Props) => {
  const { pendingLocIds, failedLocIds, retryDownload, resetAttempts } = useTargetsDownloadManager();

  return (
    <HotspotTargetsContext.Provider
      value={{
        pendingLocIds,
        failedLocIds,
        retryDownload,
        resetAttempts,
      }}
    >
      {children}
    </HotspotTargetsContext.Provider>
  );
};

const useHotspotTargets = () => {
  const [targets, setTargets] = React.useState<Targets[]>([]);
  const { trip } = useTrip();
  const state = React.useContext(HotspotTargetsContext);

  const tripId = trip?.id;

  React.useEffect(() => {
    if (!tripId) return;
    const unsubscribe = subscribeToHotspotTargets(tripId, (targets) => setTargets(targets));
    return () => {
      unsubscribe();
      setTargets([]);
    };
  }, [tripId]);

  const resetHotspotTargets = async (id: string) => {
    if (!trip) return;
    let oldTargetsId: string | undefined;
    const newHotspots = trip.hotspots.map((it) => {
      const { targetsId, ...rest } = it;
      if (it.id === id) {
        oldTargetsId = targetsId;
        return { ...rest };
      }
      return it;
    });
    state.resetAttempts(id);
    await Promise.all([updateHotspots(trip.id, newHotspots), oldTargetsId && deleteTargets(oldTargetsId)]);
  };

  return { ...state, resetHotspotTargets, allTargets: targets };
};

export { HotspotTargetsProvider, useHotspotTargets };
