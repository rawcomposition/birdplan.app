import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type HotspotListPreferencesState = {
  lastUsedListId?: string;
  setLastUsedListId: (listId: string) => void;
};

export const useHotspotListPreferencesStore = create<HotspotListPreferencesState>()(
  persist(
    (set) => ({
      lastUsedListId: undefined,
      setLastUsedListId: (listId) => set({ lastUsedListId: listId }),
    }),
    {
      name: "hotspot-list-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ lastUsedListId }) => ({ lastUsedListId }),
    }
  )
);
