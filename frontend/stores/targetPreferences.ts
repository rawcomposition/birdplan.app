import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TargetView = "group" | "personal";
export type TargetCoverage = "region" | "saved";

type TargetPreferencesState = {
  viewByTrip: Record<string, TargetView>;
  coverageByTrip: Record<string, TargetCoverage>;
  setView: (tripId: string, view: TargetView) => void;
  setCoverage: (tripId: string, coverage: TargetCoverage) => void;
};

export const useTargetPreferencesStore = create<TargetPreferencesState>()(
  persist(
    (set) => ({
      viewByTrip: {},
      coverageByTrip: {},
      setView: (tripId, view) => set((state) => ({ viewByTrip: { ...state.viewByTrip, [tripId]: view } })),
      setCoverage: (tripId, coverage) =>
        set((state) => ({ coverageByTrip: { ...state.coverageByTrip, [tripId]: coverage } })),
    }),
    {
      name: "target-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ viewByTrip, coverageByTrip }) => ({ viewByTrip, coverageByTrip }),
    }
  )
);
