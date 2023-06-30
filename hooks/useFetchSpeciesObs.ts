import React from "react";
import { useQuery } from "@tanstack/react-query";

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
    queryKey: [
      `https://api.ebird.org/v2/data/obs/${region}/recent/${code}`,
      { key: process.env.NEXT_PUBLIC_EBIRD_KEY, back: 30, includeProvisional: true },
    ],
    enabled: !!region && !!code,
    meta: {
      errorMessage: "Failed to load observations",
    },
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
