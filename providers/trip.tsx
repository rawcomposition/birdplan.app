import React from "react";
import { Trip, TargetList, CustomMarker, Invite, HotspotInput } from "lib/types";
import { subscribeToTripInvites, updateItinerary, deleteInvite, removeUserFromTrip, auth } from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";
import { fullMonths, months } from "lib/helpers";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";

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
  invites: Invite[];
  targets: TargetList | null;
  selectedSpecies?: SelectedSpecies;
  canEdit: boolean;
  isOwner: boolean;
  is404: boolean;
  selectedMarkerId?: string;
  halo?: HaloT;
  dateRangeLabel: string;
  setSelectedSpecies: (species?: SelectedSpecies) => void;
  setSelectedMarkerId: (id?: string) => void;
  setHalo: (data?: HaloT) => void;
};

const initialState = {
  trip: null,
  isFetching: false,
  targets: null,
  canEdit: false,
  isOwner: false,
  is404: false,
  invites: [],
  dateRangeLabel: "",
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  setSelectedSpecies: () => {},
  setSelectedMarkerId: () => {},
  setHalo: () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const { query, pathname } = useRouter();
  const id = query.tripId?.toString();

  const {
    data: trip,
    isFetching,
    isLoading,
  } = useQuery<Trip>({
    queryKey: [`/api/trips/${id}`],
    enabled: !!id && !!auth.currentUser,
  });

  const { data: targets } = useQuery<TargetList>({
    queryKey: [`/api/trips/${id}/targets`],
    enabled: !!id && !!auth.currentUser,
  });

  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [selectedSpecies, setSelectedSpecies] = React.useState<SelectedSpecies>();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>();
  const [halo, setHalo] = React.useState<HaloT>(); // Used to highlight selected geoJSON feature
  const { user } = useUser();
  const canEdit = !!(user?.uid && trip?.userIds?.includes(user.uid));
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);
  const is404 = !!auth.currentUser && !!id && !trip && !isLoading;

  const dateRangeLabel =
    trip?.startMonth && trip?.endMonth
      ? trip.startMonth === trip.endMonth
        ? fullMonths[trip.startMonth - 1]
        : `${months[trip.startMonth - 1]} - ${months[trip.endMonth - 1]}`
      : "";

  React.useEffect(() => {
    return () => setSelectedSpecies(undefined);
  }, [id, pathname]);

  React.useEffect(() => {
    if (!id || !isOwner) return;
    const unsubscribe = subscribeToTripInvites(id, (invites) => setInvites(invites));
    return () => {
      unsubscribe();
      setInvites([]);
    };
  }, [id, isOwner]);

  return (
    <TripContext.Provider
      value={{
        setSelectedSpecies,
        setSelectedMarkerId,
        setHalo,
        canEdit,
        isOwner,
        is404,
        trip: trip || null,
        isFetching,
        targets: targets || null,
        selectedSpecies,
        selectedMarkerId,
        halo,
        invites,
        dateRangeLabel,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

const useTrip = () => {
  const state = React.useContext(TripContext);
  const { trip } = state;
  const queryClient = useQueryClient();

  const setTripCache = async (updater: (old: Trip) => Trip) => {
    if (!trip?._id) return;
    await queryClient.cancelQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    const prevData = queryClient.getQueryData([`/api/trips/${trip?._id}`]);

    queryClient.setQueryData<Trip | undefined>([`/api/trips/${trip?._id}`], (old) => {
      if (!old) return old;
      return updater(old);
    });

    return { prevData };
  };

  const addHotspotMutation = useMutation({
    url: `/api/trips/${trip?._id}/hotspots`,
    method: "POST",
    onMutate: (data: any) =>
      setTripCache((old) => ({
        ...old,
        hotspots: [...(old.hotspots || []), data],
      })),
    onSuccess: () => {
      toast.success("Hotspot added to trip");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });

  const addMarkerMutation = useMutation({
    url: `/api/trips/${trip?._id}/markers`,
    method: "POST",
    onMutate: (data) =>
      setTripCache((old) => ({
        ...old,
        markers: [...(old.markers || []), data as any],
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });

  const appendHotspot = async (data: HotspotInput) => addHotspotMutation.mutate(data);
  const appendMarker = async (data: CustomMarker) => addMarkerMutation.mutate(data);

  const setItineraryDayNotes = async (dayId: string, notes: string) => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) return { ...it, notes };
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
  };

  const removeInvite = async (id: string, uid?: string) => {
    if (!trip) return;
    await deleteInvite(id);
    if (uid) {
      await removeUserFromTrip(trip.id, uid);
    }
  };

  return {
    ...state,
    appendHotspot,
    appendMarker,
    setItineraryDayNotes,
    removeInvite,
    setTripCache,
  };
};

export { TripProvider, useTrip };
