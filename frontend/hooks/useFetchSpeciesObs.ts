import React from "react";
import { useQuery } from "@tanstack/react-query";
import { EBIRD_BASE_URL } from "lib/config";

type Obs = {
  id: string;
  lat: number;
  lng: number;
  name: string; // Hotspot name
  isPersonal: boolean;
};

type Props = {
  region?: string;
  code?: string;
};

export default function useFetchSpeciesObs({ region, code }: Props) {
  const { data } = useQuery<Obs[]>({
    queryKey: [`${EBIRD_BASE_URL}/data/obs/${region}/recent/${code}`, { back: 30, includeProvisional: true }],
    enabled: !!region && !!code,
    meta: {
      errorMessage: "Failed to load observations",
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const obs: Obs[] =
    data?.map(({ lat, lng, locId, locationPrivate, locName }: any) => ({
      lat,
      lng,
      id: locId,
      name: locName,
      isPersonal: locationPrivate,
    })) || [];

  const obsRef = React.useRef<Obs[]>([]);
  obsRef.current = obs;
  const hasFetched = obs.length > 0;

  const layer = hasFetched
    ? {
        type: "FeatureCollection",
        features: [
          ...obsRef.current.map((it) => {
            return {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [it.lng, it.lat],
              },
              properties: {
                id: it.id,
                isPersonal: it.isPersonal ? "true" : "false",
              },
            };
          }),
        ],
      }
    : null;

  return { obs, obsLayer: layer };
}
