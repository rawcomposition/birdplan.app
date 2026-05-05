import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SpeciesHotspotPreferencesState = {
  sort: "best" | "freq";
  minObservations: number;
  recentDays: number | null;
  setSort: (sort: "best" | "freq") => void;
  setMinObservations: (minObservations: number) => void;
  setRecentDays: (recentDays: number | null) => void;
};

export const useSpeciesHotspotPreferences = create<SpeciesHotspotPreferencesState>()(
  persist(
    (set) => ({
      sort: "best",
      minObservations: 1,
      recentDays: null,
      setSort: (sort) => set({ sort }),
      setMinObservations: (minObservations) => set({ minObservations }),
      setRecentDays: (recentDays) => set({ recentDays }),
    }),
    {
      name: "species-hotspot-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ sort, minObservations, recentDays }) => ({ sort, minObservations, recentDays }),
    }
  )
);
