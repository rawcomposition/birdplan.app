import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SpeciesHotspotPreferencesState = {
  scope: "saved" | "all";
  sort: "best" | "freq";
  minObservations: number;
  recentDays: number | null;
  setScope: (scope: "saved" | "all") => void;
  setSort: (sort: "best" | "freq") => void;
  setMinObservations: (minObservations: number) => void;
  setRecentDays: (recentDays: number | null) => void;
};

export const useSpeciesHotspotPreferences = create<SpeciesHotspotPreferencesState>()(
  persist(
    (set) => ({
      scope: "all",
      sort: "best",
      minObservations: 1,
      recentDays: null,
      setScope: (scope) => set({ scope }),
      setSort: (sort) => set({ sort }),
      setMinObservations: (minObservations) => set({ minObservations }),
      setRecentDays: (recentDays) => set({ recentDays }),
    }),
    {
      name: "species-hotspot-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ scope, sort, minObservations, recentDays }) => ({ scope, sort, minObservations, recentDays }),
    }
  )
);
