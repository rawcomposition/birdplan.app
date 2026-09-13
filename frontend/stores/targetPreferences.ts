import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TargetView = "group" | "personal";
export type TargetPeriod = "trip" | "all";

type TargetPreferencesState = {
  viewByTrip: Record<string, TargetView>;
  period: TargetPeriod;
  setView: (tripId: string, view: TargetView) => void;
  setPeriod: (period: TargetPeriod) => void;
};

export const useTargetPreferencesStore = create<TargetPreferencesState>()(
  persist(
    (set) => ({
      viewByTrip: {},
      period: "all",
      setView: (tripId, view) => set((state) => ({ viewByTrip: { ...state.viewByTrip, [tripId]: view } })),
      setPeriod: (period) => set({ period }),
    }),
    {
      name: "target-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ viewByTrip, period }) => ({ viewByTrip, period }),
    }
  )
);
