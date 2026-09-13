import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TargetView = "group" | "personal";
export type TargetPeriod = "trip" | "all";

type TargetPreferencesState = {
  viewByTrip: Record<string, TargetView>;
  periodByTrip: Record<string, TargetPeriod>;
  setView: (tripId: string, view: TargetView) => void;
  setPeriod: (tripId: string, period: TargetPeriod) => void;
};

export const useTargetPreferencesStore = create<TargetPreferencesState>()(
  persist(
    (set) => ({
      viewByTrip: {},
      periodByTrip: {},
      setView: (tripId, view) => set((state) => ({ viewByTrip: { ...state.viewByTrip, [tripId]: view } })),
      setPeriod: (tripId, period) => set((state) => ({ periodByTrip: { ...state.periodByTrip, [tripId]: period } })),
    }),
    {
      name: "target-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ viewByTrip, periodByTrip }) => ({ viewByTrip, periodByTrip }),
    }
  )
);
