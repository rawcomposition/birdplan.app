import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type HotspotFilters = {
  minChecklists: number;
  minSpecies: number;
  labelIds: string[];
  excludedLabelIds: string[];
};

export type HotspotFilterScope = "explore" | "trip";

export const DEFAULT_HOTSPOT_FILTERS: HotspotFilters = {
  minChecklists: 0,
  minSpecies: 0,
  labelIds: [],
  excludedLabelIds: [],
};

type HotspotFilterPreferencesState = {
  filters: Record<HotspotFilterScope, HotspotFilters>;
  exploreShowAll: boolean;
  setFilters: (scope: HotspotFilterScope, filters: Partial<HotspotFilters>) => void;
  setExploreShowAll: (show: boolean) => void;
};

export const useHotspotFilterPreferencesStore = create<HotspotFilterPreferencesState>()(
  persist(
    (set) => ({
      filters: { explore: DEFAULT_HOTSPOT_FILTERS, trip: DEFAULT_HOTSPOT_FILTERS },
      exploreShowAll: true,
      setFilters: (scope, filters) =>
        set((state) => ({ filters: { ...state.filters, [scope]: { ...state.filters[scope], ...filters } } })),
      setExploreShowAll: (exploreShowAll) => set({ exploreShowAll }),
    }),
    {
      name: "hotspot-filter-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ filters, exploreShowAll }) => ({ filters, exploreShowAll }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<HotspotFilterPreferencesState> | undefined;
        return {
          ...current,
          exploreShowAll: stored?.exploreShowAll ?? current.exploreShowAll,
          filters: {
            explore: { ...DEFAULT_HOTSPOT_FILTERS, ...stored?.filters?.explore },
            trip: { ...DEFAULT_HOTSPOT_FILTERS, ...stored?.filters?.trip },
          },
        };
      },
    }
  )
);

export const useHotspotFilters = (scope: HotspotFilterScope) => {
  const hotspotFilters = useHotspotFilterPreferencesStore((s) => s.filters[scope]);
  const setFilters = useHotspotFilterPreferencesStore((s) => s.setFilters);
  return {
    hotspotFilters,
    setHotspotFilters: (filters: Partial<HotspotFilters>) => setFilters(scope, filters),
  };
};

export const matchesLabelFilters = (
  labelIds: string[] | undefined,
  { labelIds: included, excludedLabelIds: excluded }: HotspotFilters
) => {
  const ids = labelIds || [];
  if (excluded.some((id) => ids.includes(id))) return false;
  return included.length === 0 || included.some((id) => ids.includes(id));
};
