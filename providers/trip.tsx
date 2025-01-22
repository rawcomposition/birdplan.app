import React from "react";
import { Hotspot, Trip, Targets, CustomMarker, Invite, TravelData } from "lib/types";
import {
  subscribeToTrip,
  subscribeToTripTargets,
  subscribeToTripInvites,
  updateHotspots,
  updateItinerary,
  updateTargets,
  updateMarkers,
  deleteInvite,
  removeUserFromTrip,
  setTripStartDate,
  addTargetStarToTrip,
  removeTargetStarFromTrip,
  setTargetNotesOnTrip,
  deleteTargets,
} from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";
import { mostFrequentValue, randomId, fullMonths, months } from "lib/helpers";
import { getTravelTime } from "lib/mapbox";
import toast from "react-hot-toast";

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
  targets: Targets;
  selectedSpecies?: SelectedSpecies;
  canEdit: boolean;
  isOwner: boolean;
  is404: boolean;
  selectedMarkerId?: string;
  halo?: HaloT;
  dateRangeLabel: string;
  isHotspotListOpen: boolean;
  setSelectedSpecies: (species?: SelectedSpecies) => void;
  setSelectedMarkerId: (id?: string) => void;
  setHalo: (data?: HaloT) => void;
  setIsHotspotListOpen: (open: boolean) => void;
};

const initialState = {
  trip: null,
  targets: {
    items: [],
    N: 0,
    yrN: 0,
    tripId: "",
  },
  canEdit: false,
  isOwner: false,
  is404: false,
  invites: [],
  dateRangeLabel: "",
  isHotspotListOpen: false,
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  setSelectedSpecies: () => {},
  setSelectedMarkerId: () => {},
  setHalo: () => {},
  setIsHotspotListOpen: () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [targets, setTripTargets] = React.useState<Targets>(initialState.targets);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [selectedSpecies, setSelectedSpecies] = React.useState<SelectedSpecies>();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>();
  const [halo, setHalo] = React.useState<HaloT>(); // Used to highlight selected geoJSON feature
  const [is404, setIs404] = React.useState(false);
  const [isHotspotListOpen, setIsHotspotListOpen] = React.useState(false);
  const { query, pathname } = useRouter();
  const id = query.tripId?.toString();
  const { user } = useUser();
  const canEdit = !!(user?.uid && trip?.userIds?.includes(user.uid));
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);

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
    if (!id) return;
    const unsubscribe = subscribeToTrip(
      id,
      (trip) => {
        setTrip(trip);
        setIs404(false);
      },
      () => setIs404(true)
    );
    return () => {
      unsubscribe();
      setTrip(null);
      setIs404(false);
    };
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToTripTargets(id, (targets) => {
      setTripTargets(targets);
    });
    return () => {
      unsubscribe();
      setTripTargets(initialState.targets);
    };
  }, [id]);

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
        trip,
        targets,
        selectedSpecies,
        selectedMarkerId,
        halo,
        invites,
        dateRangeLabel,
        isHotspotListOpen,
        setIsHotspotListOpen,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

const useTrip = () => {
  const state = React.useContext(TripContext);
  const { trip } = state;

  const appendHotspot = async (hotspot: Hotspot) => {
    if (!trip) return;
    const alreadyExists = trip.hotspots.find((it) => it.id === hotspot.id);
    const newHotspots = alreadyExists ? trip.hotspots : [...trip.hotspots, hotspot];
    await updateHotspots(trip.id, newHotspots);
  };

  const removeHotspot = async (id: string) => {
    if (!trip) return;
    const hotspot = trip.hotspots.find((it) => it.id === id);
    const newHotspots = trip.hotspots.filter((it) => it.id !== id);
    await Promise.all([updateHotspots(trip.id, newHotspots), hotspot?.targetsId && deleteTargets(hotspot.targetsId)]);
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

  const saveMarkerNotes = async (id: string, notes: string) => {
    if (!trip) return;
    const newMarkers = trip.markers.map((it) => {
      if (it.id === id) return { ...it, notes };
      return it;
    });
    await updateMarkers(trip.id, newMarkers);
  };

  const addHotspotFav = async (id: string, code: string, name: string, range: string, percent: number) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) {
        const favs = it.favs ? [...it.favs, { code, name, range, percent }] : [{ code, name, range, percent }];
        return { ...it, favs };
      }
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const removeHotspotFav = async (id: string, code: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) {
        const favs = it.favs?.filter((it) => it.code !== code);
        return { ...it, favs };
      }
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const setTargets = async (data: Targets) => {
    if (!trip) return;
    await updateTargets(trip.id, data, true);
  };

  const setTargetNotes = async (code: string, notes: string) => {
    if (!trip || !state.targets) return;
    await setTargetNotesOnTrip(trip.id, code, notes);
  };

  const addTargetStar = async (code: string) => {
    if (!trip || !state.targets) return;
    await addTargetStarToTrip(trip.id, code);
  };

  const removeTargetStar = async (code: string) => {
    if (!trip || !state.targets) return;
    await removeTargetStarFromTrip(trip.id, code);
  };

  const saveHotspotNotes = async (id: string, notes: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) return { ...it, notes };
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const setTranslatedHotspotName = async (id: string, translatedName: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) return { ...it, name: translatedName, originalName: it.name };
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const resetTranslatedHotspotName = async (id: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) return it.originalName ? { ...it, name: it.originalName, originalName: "" } : it;
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const removeInvite = async (id: string, uid?: string) => {
    if (!trip) return;
    await deleteInvite(id);
    if (uid) {
      await removeUserFromTrip(trip.id, uid);
    }
  };

  const setStartDate = async (date: string) => {
    if (!trip) return;
    await setTripStartDate(trip.id, date);
  };

  const appendItineraryDay = async () => {
    if (!trip) return;
    const newItinerary = [...(trip.itinerary || []), { id: randomId(6), locations: [] }];
    await updateItinerary(trip.id, newItinerary);
  };

  const removeItineraryDay = async (id: string) => {
    if (!trip) return;
    const newItinerary = trip.itinerary?.filter((it) => it.id !== id) || [];
    await updateItinerary(trip.id, newItinerary);
  };

  const addItineraryDayLocation = async (dayId: string, type: "hotspot" | "marker", locationId: string) => {
    if (!trip) return;
    const id = randomId(6);
    const newItinerary =
      trip.itinerary?.map((it) => {
        if (it.id === dayId) {
          const locations = [...(it.locations || []), { type, locationId, id }];
          return { ...it, locations };
        }
        return it;
      }) || [];
    await updateItinerary(trip.id, newItinerary);
    await recalcTravelTime(newItinerary, dayId);
  };

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

  return {
    ...state,
    appendHotspot,
    removeHotspot,
    appendMarker,
    removeMarker,
    setTargets,
    setStartDate,
    setTargetNotes,
    addTargetStar,
    removeTargetStar,
    appendItineraryDay,
    removeItineraryDay,
    addItineraryDayLocation,
    removeItineraryDayLocation,
    moveItineraryDayLocation,
    setItineraryDayNotes,
    markTravelTimeDeleted,
    calcTravelTime,
    saveHotspotNotes,
    saveMarkerNotes,
    addHotspotFav,
    removeHotspotFav,
    setTranslatedHotspotName,
    resetTranslatedHotspotName,
    removeInvite,
  };
};

export { TripProvider, useTrip };
