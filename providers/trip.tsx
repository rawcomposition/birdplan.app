import React from "react";
import { Trip, TargetList, CustomMarker, Invite, TravelData, HotspotInput } from "lib/types";
import {
  subscribeToTripInvites,
  updateItinerary,
  deleteInvite,
  removeUserFromTrip,
  setTripStartDate,
  auth,
} from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";
import { mostFrequentValue, nanoId, fullMonths, months } from "lib/helpers";
import { getTravelTime } from "lib/mapbox";
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

  const { data: trip, isLoading } = useQuery<Trip>({
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

  const removeItineraryDayLocation = async (dayId: string, id: string) => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) {
          const locations = it.locations?.filter((it) => it.id !== id);
          return { ...it, locations };
        }
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
    await recalcTravelTime(newItinerary, dayId);
  };

  const moveItineraryDayLocation = async (dayId: string, id: string, direction: "up" | "down") => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) {
          const locations = [...(it.locations || [])];
          const locationIndex = locations.findIndex((it) => it.id === id);
          const location = locations.splice(locationIndex, 1)[0];
          const newIndex = direction === "up" ? locationIndex - 1 : locationIndex + 1;
          locations.splice(newIndex, 0, location);
          return { ...it, locations };
        }
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
    await recalcTravelTime(newItinerary, dayId);
  };

  const setItineraryDayNotes = async (dayId: string, notes: string) => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) return { ...it, notes };
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
  };

  const recalcTravelTime = async (itinerary: Trip["itinerary"], dayId: string) => {
    if (!trip) return;
    const existingMethods =
      itinerary?.find((it) => it.id === dayId)?.locations?.map((it) => it.travel?.method || null) || [];
    const defaultMethod = mostFrequentValue(existingMethods) as "walking" | "driving" | "cycling" | null;
    const newItinerary = await Promise.all(
      itinerary?.map(async (day) => {
        const locations = await Promise.all(
          day.locations?.map(async ({ travel, ...it }, index) => {
            const prevLocation = day.locations[index - 1];
            if (!prevLocation) return it;
            if (prevLocation.locationId && prevLocation.locationId == it.locationId) {
              return {
                ...it,
                travel: {
                  distance: 0,
                  time: 0,
                  method: travel?.method || defaultMethod || "driving",
                  locationId: prevLocation.locationId,
                },
              };
            }
            const travelData = await calcTravelTime({
              dayId: day.id,
              id: it.id,
              locationId1: prevLocation.locationId,
              locationId2: it.locationId,
              method: travel?.method || defaultMethod || "driving",
            });
            return travelData ? { ...it, travel: travelData } : it;
          }) || []
        );
        return { ...day, locations };
      }) || []
    );
    await updateItinerary(trip.id, newItinerary);
  };

  const markTravelTimeDeleted = async (dayId: string, id: string) => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) {
          const locations = it.locations?.map((it) => {
            if (it.id === id) return { ...it, travel: it.travel ? { ...it.travel, isDeleted: true } : undefined };
            return it;
          });
          return { ...it, locations };
        }
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
  };

  const saveItineraryTravelData = async (dayId: string, id: string, data: TravelData) => {
    if (!trip) return;
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) {
          const locations = it.locations?.map((it) => {
            if (it.id === id) return { ...it, travel: data };
            return it;
          });
          return { ...it, locations };
        }
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
  };

  type CalcTravelTimePropsType = {
    dayId: string;
    id: string;
    locationId1: string;
    locationId2: string;
    method: "walking" | "driving" | "cycling";
    save?: boolean;
  };

  const calcTravelTime = async ({ dayId, id, locationId1, locationId2, method, save }: CalcTravelTimePropsType) => {
    const location1 =
      trip?.hotspots?.find((h) => h.id === locationId1 || "") || trip?.markers?.find((m) => m.id === locationId1 || "");

    const location2 =
      trip?.hotspots?.find((h) => h.id === locationId2 || "") || trip?.markers?.find((m) => m.id === locationId2 || "");

    if (!location1 || !location2) {
      toast.error(`Unable to calculate travel time to ${location2?.name || "unknown location"}`);
      return;
    }

    if (locationId1 && locationId1 === locationId2) {
      const travelData = {
        distance: 0,
        time: 0,
        method,
        locationId: locationId1,
      };
      if (save) {
        await saveItineraryTravelData(dayId, id, travelData);
      }
      return travelData;
    }

    console.log(`Calculating travel time from ${location1.name} to ${location2.name}`);
    const { lat: lat1, lng: lng1 } = location1;
    const { lat: lat2, lng: lng2 } = location2;
    try {
      const data = await getTravelTime({ method, lat1, lng1, lat2, lng2 });
      if (!data || !data.distance || !data.time) throw new Error("No data");
      const travelData = {
        distance: data.distance,
        time: data.time,
        method,
        locationId: locationId1,
      };

      if (save) {
        await saveItineraryTravelData(dayId, id, travelData);
      }
      return travelData;
    } catch (e) {
      toast.error(`Unable to calculate travel time to ${location2?.name || "Unknown location"}`);
      return null;
    }
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
    removeItineraryDayLocation,
    moveItineraryDayLocation,
    setItineraryDayNotes,
    markTravelTimeDeleted,
    calcTravelTime,
    removeInvite,
    setTripCache,
  };
};

export { TripProvider, useTrip };
