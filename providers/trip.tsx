import React from "react";
import { Hotspot, Trip, Target, CustomMarker, Invite } from "lib/types";
import {
  subscribeToTrip,
  subscribeToTripTargets,
  subscribeToTripInvites,
  updateHotspots,
  updateTargets,
  updateMarkers,
  deleteInvite,
  removeUserFromTrip,
} from "lib/firebase";
import { useRouter } from "next/router";
import { useUser } from "providers/user";

type ContextT = {
  trip: Trip | null;
  invites: Invite[];
  targets: Target[];
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
  setTargets: (target: Target[]) => Promise<void>;
  removeTarget: (code: string) => Promise<void>;
  saveNotes: (id: string, notes: string) => Promise<void>;
  setTranslatedHotspotName: (id: string, translatedName: string) => Promise<void>;
  resetTranslatedHotspotName: (id: string) => Promise<void>;
  reset: () => void;
  removeInvite: (inviteId: string, uid?: string) => Promise<void>;
};

const initialState = {
  trip: null,
  targets: [],
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
  saveNotes: async () => {},
  setTranslatedHotspotName: async () => {},
  resetTranslatedHotspotName: async () => {},
  reset: () => {},
  removeInvite: async () => {},
});

type Props = {
  children: React.ReactNode;
};

const TripProvider = ({ children }: Props) => {
  const [trip, setTrip] = React.useState<Trip | null>(null);
  const [targets, setTripTargets] = React.useState<Target[]>([]);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [selectedSpeciesCode, setSelectedSpeciesCode] = React.useState<string>();
  const [selectedMarkerId, setSelectedMarkerId] = React.useState<string>();
  const id = useRouter().query.tripId?.toString();
  const { user } = useUser();
  const canEdit = !!(user?.uid && trip?.userIds?.includes(user.uid));
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);

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

  const setTargets = async (targets: Target[]) => {
    if (!trip) return;
    await updateTargets(trip.id, targets);
  };

  const removeTarget = async (code: string) => {
    if (!trip) return;
    const newTargets = targets.filter((it) => it.code !== code);
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

  const reset = React.useCallback(() => {
    setTrip(null);
    setSelectedSpeciesCode(undefined);
  }, []);

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
        saveNotes,
        setTranslatedHotspotName,
        resetTranslatedHotspotName,
        removeInvite,
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
