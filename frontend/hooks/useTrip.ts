import React from "react";
import { create } from "zustand";
import { Trip, ParticipantView } from "@birdplan/shared";
import { useLocation } from "react-router-dom";
import { useUser } from "hooks/useUser";
import { useSessionToken } from "lib/sessionToken";
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

type SetState<T> = T | ((prev: T) => T);

type TripUiState = {
  selectedSpecies?: SelectedSpecies;
  selectedMarkerId?: string;
  halo?: HaloT;
  showAllHotspots: boolean;
  showSatellite: boolean;
  setSelectedSpecies: (species?: SelectedSpecies) => void;
  setSelectedMarkerId: (id?: string) => void;
  setHalo: (data?: HaloT) => void;
  setShowAllHotspots: (show: SetState<boolean>) => void;
  setShowSatellite: (show: SetState<boolean>) => void;
};

const resolve = <T,>(value: SetState<T>, prev: T): T =>
  typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

const useTripUiStore = create<TripUiState>((set) => ({
  showAllHotspots: false,
  showSatellite: false,
  setSelectedSpecies: (selectedSpecies) => set({ selectedSpecies }),
  setSelectedMarkerId: (selectedMarkerId) => set({ selectedMarkerId }),
  setHalo: (halo) => set({ halo }),
  setShowAllHotspots: (show) => set((s) => ({ showAllHotspots: resolve(show, s.showAllHotspots) })),
  setShowSatellite: (show) => set((s) => ({ showSatellite: resolve(show, s.showSatellite) })),
}));

export const useClearSelectedSpeciesOnNavigate = () => {
  const { pathname } = useLocation();
  const setSelectedSpecies = useTripUiStore((s) => s.setSelectedSpecies);
  React.useEffect(() => {
    return () => setSelectedSpecies(undefined);
  }, [pathname, setSelectedSpecies]);
};

export const useTrip = () => {
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
  const token = useSessionToken();
  const canEdit = !!trip?.viewer;
  const isOwner = !!(user?.uid && trip?.ownerId === user.uid);

  const { data: participants } = useQuery<ParticipantView[]>({
    queryKey: [`/trips/${id}/participants`],
    enabled: !!id && !!token && !!trip,
  });

  const ui = useTripUiStore();
  const is404 = !!token && !!id && !trip && !isLoading;

  const dateRangeLabel =
    trip?.startMonth && trip?.endMonth
      ? trip.startMonth === trip.endMonth
        ? fullMonths[trip.startMonth - 1]
        : `${months[trip.startMonth - 1]} - ${months[trip.endMonth - 1]}`
      : "";

  return {
    trip: trip || null,
    isFetching,
    participants: participants || null,
    selectedSpecies: ui.selectedSpecies,
    canEdit,
    isOwner,
    is404,
    selectedMarkerId: ui.selectedMarkerId,
    halo: ui.halo,
    dateRangeLabel,
    showAllHotspots: ui.showAllHotspots,
    showSatellite: ui.showSatellite,
    setSelectedSpecies: ui.setSelectedSpecies,
    setSelectedMarkerId: ui.setSelectedMarkerId,
    setHalo: ui.setHalo,
    setShowAllHotspots: ui.setShowAllHotspots,
    setShowSatellite: ui.setShowSatellite,
    refetch,
  };
};
