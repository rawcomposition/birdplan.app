import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type MapPreferencesState = {
  showPersonalLocations: boolean;
  savedHotspotsOnly: boolean;
  setShowPersonalLocations: (showPersonalLocations: boolean) => void;
  setSavedHotspotsOnly: (savedHotspotsOnly: boolean) => void;
};

export const useMapPreferences = create<MapPreferencesState>()(
  persist(
    (set) => ({
      showPersonalLocations: true,
      savedHotspotsOnly: false,
      setShowPersonalLocations: (showPersonalLocations) => set({ showPersonalLocations }),
      setSavedHotspotsOnly: (savedHotspotsOnly) => set({ savedHotspotsOnly }),
    }),
    {
      name: "map-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ showPersonalLocations, savedHotspotsOnly }) => ({ showPersonalLocations, savedHotspotsOnly }),
    }
  )
);
