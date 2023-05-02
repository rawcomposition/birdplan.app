import React from "react";
import { Hotspot, Trip, Target, CustomMarker } from "lib/types";
import { subscribeToTrip, updateHotspots, updateTargets, updateMarkers } from "lib/firebase";
import { useRouter } from "next/router";

type ContextT = {
  trip: Trip | null;
  selectedSpeciesCode?: string;
  setSelectedSpeciesCode: (code?: string) => void;
  appendHotspot: (hotspot: Hotspot) => Promise<void>;
  removeHotspot: (id: string) => Promise<void>;
  appendMarker: (marker: CustomMarker) => Promise<void>;
  removeMarker: (id: string) => Promise<void>;
  setTargets: (target: Target[]) => Promise<void>;
  removeTarget: (code: string) => Promise<void>;
  saveNotes: (id: string, notes: string) => Promise<void>;
  reset: () => void;
};

const initialState = {
  trip: null,
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  setSelectedSpeciesCode: () => {},
  appendHotspot: async () => {},
  removeHotspot: async () => {},
  appendMarker: async () => {},
  removeMarker: async () => {},
  setTargets: async () => {},
  removeTarget: async () => {},
  saveNotes: async () => {},
  reset: () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [selectedSpeciesCode, setSelectedSpeciesCode] = React.useState<string>();
  const id = useRouter().query.tripId?.toString();

  React.useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToTrip(id, (trip) => setTrip(trip));
    return () => unsubscribe();
  }, [id]);

  const appendHotspot = async (hotspot: Hotspot) => {
    if (!trip) return;
    const alreadyExists = trip.hotspots.find((it) => it.id === hotspot.id);
    const newHotspots = alreadyExists ? trip.hotspots : [...trip.hotspots, hotspot];
    await updateHotspots(trip.id, newHotspots);
  };

  const removeHotspot = async (id: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.filter((it) => it.id !== id);
    await updateHotspots(trip.id, newHotspots);
  };

  const appendMarker = async (marker: CustomMarker) => {
    if (!trip) return;
    const alreadyExists = trip.markers.find((it) => it.id === marker.id);
    const newMarkers = alreadyExists ? trip.markers : [...trip.markers, marker];
    await updateMarkers(trip.id, newMarkers);
  };

  const removeMarker = async (id: string) => {
    if (!trip) return;
    const newMarkers = trip.markers.filter((it) => it.id !== id);
    await updateMarkers(trip.id, newMarkers);
  };

  const setTargets = async (targets: Target[]) => {
    if (!trip) return;
    await updateTargets(trip.id, targets);
  };

  const removeTarget = async (code: string) => {
    if (!trip) return;
    const newTargets = trip.targets.filter((it) => it.code !== code);
    await updateTargets(trip.id, newTargets);
  };

  const saveNotes = async (id: string, notes: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) return { ...it, notes };
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const reset = React.useCallback(() => {
    setTrip(null);
    setSelectedSpeciesCode(undefined);
  }, []);

  return (
    <TripContext.Provider
      value={{
        trip,
        selectedSpeciesCode,
        setSelectedSpeciesCode,
        appendHotspot,
        removeHotspot,
        appendMarker,
        removeMarker,
        setTargets,
        removeTarget,
        saveNotes,
        reset,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

const useTrip = () => {
  const state = React.useContext(TripContext);
  return { ...state };
};

export { TripProvider, useTrip };
