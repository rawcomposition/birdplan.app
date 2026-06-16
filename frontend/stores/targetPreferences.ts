import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TargetView = "group" | "mine";

type TargetPreferencesState = {
  viewByTrip: Record<string, TargetView>;
  setView: (tripId: string, view: TargetView) => void;
};

export const useTargetPreferencesStore = create<TargetPreferencesState>()(
  persist(
    (set) => ({
      viewByTrip: {},
      setView: (tripId, view) => set((state) => ({ viewByTrip: { ...state.viewByTrip, [tripId]: view } })),
    }),
    {
      name: "target-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ viewByTrip }) => ({ viewByTrip }),
    }
  )
);
