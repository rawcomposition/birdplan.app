import React from "react";
import { Hotspot, Trip, Targets, CustomMarker, Invite } from "lib/types";
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
} from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";
import { randomId } from "lib/helpers";

type ContextT = {
  trip: Trip | null;
  invites: Invite[];
  targets: Targets;
  selectedSpeciesCode?: string;
  canEdit: boolean;
  isOwner: boolean;
  selectedMarkerId?: string;
  setSelectedSpeciesCode: (code?: string) => void;
  setSelectedMarkerId: (id?: string) => void;
  appendHotspot: (hotspot: Hotspot) => Promise<void>;
  removeHotspot: (id: string) => Promise<void>;
  appendMarker: (marker: CustomMarker) => Promise<void>;
  removeMarker: (id: string) => Promise<void>;
  setTargets: ({ items, N, yrN }: Targets) => Promise<void>;
  removeTarget: (code: string) => Promise<void>;
  setStartDate: (date: string) => Promise<void>;
  appendItineraryDay: () => Promise<void>;
  removeItineraryDay: (id: string) => Promise<void>;
  addItineraryDayLocation: (dayId: string, type: "hotspot" | "marker", locationId: string) => Promise<void>;
  removeItineraryDayLocation: (dayId: string, locationId: string) => Promise<void>;
  moveItineraryDayLocation: (dayId: string, locationId: string, direction: "up" | "down") => Promise<void>;
  saveHotspotNotes: (id: string, notes: string) => Promise<void>;
  setHotspotTargetsId: (hotspotId: string, targetsId: string) => Promise<void>;
  saveMarkerNotes: (id: string, notes: string) => Promise<void>;
  addHotspotFav: (id: string, code: string, name: string, range: string, percent: number) => Promise<void>;
  removeHotspotFav: (id: string, code: string) => Promise<void>;
  setTranslatedHotspotName: (id: string, translatedName: string) => Promise<void>;
  resetTranslatedHotspotName: (id: string) => Promise<void>;
  removeInvite: (inviteId: string, uid?: string) => Promise<void>;
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
  invites: [],
};

export const TripContext = React.createContext<ContextT>({
  ...initialState,
  setSelectedSpeciesCode: () => {},
  setSelectedMarkerId: () => {},
  appendHotspot: async () => {},
  removeHotspot: async () => {},
  appendMarker: async () => {},
  removeMarker: async () => {},
  setTargets: async () => {},
  removeTarget: async () => {},
  setStartDate: async () => {},
  appendItineraryDay: async () => {},
  removeItineraryDay: async () => {},
  addItineraryDayLocation: async () => {},
  removeItineraryDayLocation: async () => {},
  moveItineraryDayLocation: async () => {},
  saveHotspotNotes: async () => {},
  addHotspotFav: async () => {},
  setHotspotTargetsId: async () => {},
  saveMarkerNotes: async () => {},
  removeHotspotFav: async () => {},
  setTranslatedHotspotName: async () => {},
  resetTranslatedHotspotName: async () => {},
  removeInvite: async () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [targets, setTripTargets] = React.useState<Targets>(initialState.targets);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [selectedSpeciesCode, setSelectedSpeciesCode] = React.useState<string>();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>();
  const id = useRouter().query.tripId?.toString();
  const { user } = useUser();
  const canEdit = !!(user?.uid && trip?.userIds?.includes(user.uid));
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);

  React.useEffect(() => {
    return () => {
      setTrip(null);
      setSelectedSpeciesCode(undefined);
      setTripTargets(initialState.targets);
    };
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToTrip(id, (trip) => setTrip(trip));
    return () => unsubscribe();
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToTripTargets(id, (targets) => setTripTargets(targets));
    return () => unsubscribe();
  }, [id]);

  React.useEffect(() => {
    if (!id || !isOwner) return;
    const unsubscribe = subscribeToTripInvites(id, (invites) => setInvites(invites));
    return () => unsubscribe();
  }, [id, isOwner]);

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

  const removeTarget = async (code: string) => {
    if (!trip) return;
    const newTargets = { ...targets, items: targets.items.filter((it) => it.code !== code) };
    await updateTargets(trip.id, newTargets);
  };

  const saveHotspotNotes = async (id: string, notes: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === id) return { ...it, notes };
      return it;
    });
    await updateHotspots(trip.id, newHotspots);
  };

  const setHotspotTargetsId = async (hotspotId: string, targetsId: string) => {
    if (!trip) return;
    const newHotspots = trip.hotspots.map((it) => {
      if (it.id === hotspotId) return { ...it, targetsId };
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
    const newItinerary = trip.itinerary?.filter((it) => it.id !== id);
    await updateItinerary(trip.id, newItinerary);
  };

  const addItineraryDayLocation = async (dayId: string, type: "hotspot" | "marker", locationId: string) => {
    if (!trip) return;
    const newItinerary = trip.itinerary?.map((it) => {
      if (it.id === dayId) {
        const locations = [...(it.locations || []), { type, locationId }];
        return { ...it, locations };
      }
      return it;
    });
    await updateItinerary(trip.id, newItinerary);
  };

  const removeItineraryDayLocation = async (dayId: string, locationId: string) => {
    if (!trip) return;
    const newItinerary = trip.itinerary?.map((it) => {
      if (it.id === dayId) {
        const locations = it.locations?.filter((it) => it.locationId !== locationId);
        return { ...it, locations };
      }
      return it;
    });
    await updateItinerary(trip.id, newItinerary);
  };

  const moveItineraryDayLocation = async (dayId: string, locationId: string, direction: "up" | "down") => {
    if (!trip) return;
    const newItinerary = trip.itinerary?.map((it) => {
      if (it.id === dayId) {
        const locations = [...(it.locations || [])];
        const locationIndex = locations.findIndex((it) => it.locationId === locationId);
        const location = locations.splice(locationIndex, 1)[0];
        const newIndex = direction === "up" ? locationIndex - 1 : locationIndex + 1;
        locations.splice(newIndex, 0, location);
        return { ...it, locations };
      }
      return it;
    });
    await updateItinerary(trip.id, newItinerary);
  };

  return (
    <TripContext.Provider
      value={{
        canEdit,
        isOwner,
        trip,
        targets,
        selectedSpeciesCode,
        selectedMarkerId,
        invites,
        setSelectedSpeciesCode,
        setSelectedMarkerId,
        appendHotspot,
        removeHotspot,
        appendMarker,
        removeMarker,
        setTargets,
        removeTarget,
        setStartDate,
        appendItineraryDay,
        removeItineraryDay,
        addItineraryDayLocation,
        removeItineraryDayLocation,
        moveItineraryDayLocation,
        saveHotspotNotes,
        setHotspotTargetsId,
        saveMarkerNotes,
        addHotspotFav,
        removeHotspotFav,
        setTranslatedHotspotName,
        resetTranslatedHotspotName,
        removeInvite,
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
