import React from "react";
import { Hotspot, Trip } from "lib/types";
import { getTrip, updateHotspots } from "lib/firebase";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useUser } from "providers/user";

type ContextT = {
  trip: Trip | null;
  loading: boolean;
  appendHotspot: (hotspot: Hotspot) => Promise<void>;
  removeHotspot: (id: string) => Promise<void>;
};

const initialState = {
  trip: null,
  loading: false,
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  appendHotspot: async () => {},
  removeHotspot: async () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [loading, setLoading] = React.useState(false);
  const id = useRouter().query.tripId?.toString();
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!id || !uid) return;
    (async () => {
      setLoading(true);
      setTrip(null);
      try {
        const trip = await getTrip(id);
        setTrip(trip || null);
        setLoading(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch trip");
      }
    })();
  }, [id, uid]);

  const appendHotspot = async (hotspot: Hotspot) => {
    if (!trip) return;
    const alreadyExists = trip.hotspots.find((it) => it.id === hotspot.id);
    const newHotspots = alreadyExists ? trip.hotspots : [...trip.hotspots, hotspot];
    setTrip((prev) => prev && { ...prev, hotspots: newHotspots });
    await updateHotspots(trip.id, newHotspots);
  };

  const removeHotspot = async (id: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.filter((it) => it.id !== id);
    setTrip((prev) => prev && { ...prev, hotspots: newHotspots });
    await updateHotspots(trip.id, newHotspots);
  };

  return (
    <TripContext.Provider
      value={{
        trip,
        loading,
        appendHotspot,
        removeHotspot,
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
