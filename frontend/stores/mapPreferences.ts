import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type MapPreferencesState = {
  showPersonalLocations: boolean;
  setShowPersonalLocations: (showPersonalLocations: boolean) => void;
};

export const useMapPreferences = create<MapPreferencesState>()(
  persist(
    (set) => ({
      showPersonalLocations: true,
      setShowPersonalLocations: (showPersonalLocations) => set({ showPersonalLocations }),
    }),
    {
      name: "map-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ showPersonalLocations }) => ({ showPersonalLocations }),
    }
  )
);
