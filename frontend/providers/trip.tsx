import React from "react";
import { Trip, ParticipantView } from "@birdplan/shared";
import { auth } from "lib/firebase";
import { useLocation } from "react-router-dom";
import { useUser } from "providers/user";
import { fullMonths, months, getTripIdFromPath } from "lib/helpers";
import { useQuery } from "@tanstack/react-query";

type SelectedSpecies = {
  code: string;
  name: string;
};

type HaloT = {
  lat: number;
  lng: number;
  color: string;
};

type ContextT = {
  trip: Trip | null;
  isFetching: boolean;
  participants: ParticipantView[] | null;
  selectedSpecies?: SelectedSpecies;
  canEdit: boolean;
  isOwner: boolean;
  is404: boolean;
  selectedMarkerId?: string;
  halo?: HaloT;
  dateRangeLabel: string;
  showAllHotspots: boolean;
  showSatellite: boolean;
  setSelectedSpecies: (species?: SelectedSpecies) => void;
  setSelectedMarkerId: (id?: string) => void;
  setHalo: (data?: HaloT) => void;
  setShowAllHotspots: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowSatellite: (show: boolean | ((prev: boolean) => boolean)) => void;
  refetch: () => void;
};

const initialState = {
  trip: null,
  isFetching: false,
  participants: null,
  canEdit: false,
  isOwner: false,
  is404: false,
  dateRangeLabel: "",
  showAllHotspots: false,
  showSatellite: false,
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  setSelectedSpecies: () => {},
  setSelectedMarkerId: () => {},
  setHalo: () => {},
  setShowAllHotspots: () => {},
  setShowSatellite: () => {},
  refetch: () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const { pathname } = useLocation();
  const id = getTripIdFromPath(pathname);

  const {
    data: trip,
    isFetching,
    isLoading,
    refetch,
  } = useQuery<Trip>({
    queryKey: [`/trips/${id}`],
    enabled: !!id,
    refetchInterval: 1000 * 60 * 2,
  });

  const { user } = useUser();
  const canEdit = !!trip?.viewer;
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);

  const { data: participants } = useQuery<ParticipantView[]>({
    queryKey: [`/trips/${id}/participants`],
    enabled: !!id && !!auth?.currentUser && !!trip,
    refetchOnWindowFocus: false,
  });

  const [selectedSpecies, setSelectedSpecies] = React.useState<SelectedSpecies>();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>();
  const [halo, setHalo] = React.useState<HaloT>(); // Used to highlight selected geoJSON feature
  const [showAllHotspots, setShowAllHotspots] = React.useState(false);
  const [showSatellite, setShowSatellite] = React.useState(false);
  const is404 = !!auth?.currentUser && !!id && !trip && !isLoading;

  const dateRangeLabel =
    trip?.startMonth && trip?.endMonth
      ? trip.startMonth === trip.endMonth
        ? fullMonths[trip.startMonth - 1]
        : `${months[trip.startMonth - 1]} - ${months[trip.endMonth - 1]}`
      : "";

  React.useEffect(() => {
    return () => setSelectedSpecies(undefined);
  }, [id, pathname]);

  return (
    <TripContext.Provider
      value={{
        setSelectedSpecies,
        setSelectedMarkerId,
        setHalo,
        setShowAllHotspots,
        setShowSatellite,
        refetch,
        participants: participants || null,
        canEdit,
        isOwner,
        is404,
        trip: trip || null,
        isFetching,
        selectedSpecies,
        selectedMarkerId,
        halo,
        dateRangeLabel,
        showAllHotspots,
        showSatellite,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

const useTrip = () => React.useContext(TripContext);

export { TripProvider, useTrip };
