import React from "react";
import { Hotspot, Trip } from "lib/types";
import { subscribeToTrip, updateHotspots } from "lib/firebase";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useUser } from "providers/user";
import * as fs from "firebase/firestore";

type ContextT = {
  trip: Trip | null;
  selectedSpeciesCode?: string;
  setSelectedSpeciesCode: (code?: string) => void;
  appendHotspot: (hotspot: Hotspot) => Promise<void>;
  removeHotspot: (id: string) => Promise<void>;
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
  reset: () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [selectedSpeciesCode, setSelectedSpeciesCode] = React.useState<string>();
  const id = useRouter().query.tripId?.toString();
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!id || !uid) return;
    const unsubscribe = subscribeToTrip(id, (trip) => setTrip(trip));
    return () => unsubscribe();
  }, [id, uid]);

  const appendHotspot = async (hotspot: Hotspot) => {
    if (!trip) return;
    const alreadyExists = trip.hotspots.find((it) => it.id === hotspot.id);
    const newHotspots = alreadyExists ? trip.hotspots : [...trip.hotspots, hotspot];
    try {
      await updateHotspots(trip.id, newHotspots);
    } catch (error) {
      toast.error("Error saving changes");
    }
  };

  const removeHotspot = async (id: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.filter((it) => it.id !== id);
    try {
      await updateHotspots(trip.id, newHotspots);
    } catch (error) {
      toast.error("Error saving changes");
    }
  };

  const reset = () => {
    setTrip(null);
    setSelectedSpeciesCode(undefined);
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        selectedSpeciesCode,
        setSelectedSpeciesCode,
        appendHotspot,
        removeHotspot,
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
