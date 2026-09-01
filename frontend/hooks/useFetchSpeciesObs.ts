import { useQuery } from "@tanstack/react-query";
import { EBIRD_BASE_URL } from "lib/config";
import { useMapPreferences } from "stores/mapPreferences";

type Obs = {
  id: string;
  lat: number;
  lng: number;
  name: string; // Hotspot name
  isPersonal: boolean;
  obsDt: string; // Most recent observation date at this location
};

type Props = {
  region?: string;
  code?: string;
};

export default function useFetchSpeciesObs({ region, code }: Props) {
  const showPersonalLocations = useMapPreferences((state) => state.showPersonalLocations);

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
    data
      ?.filter(({ locationPrivate }: any) => showPersonalLocations || !locationPrivate)
      .map(({ lat, lng, locId, locationPrivate, locName, obsDt }: any) => ({
        lat,
        lng,
        id: locId,
        name: locName,
        isPersonal: locationPrivate,
        obsDt,
      })) || [];

  const hasFetched = obs.length > 0;

  const layer = hasFetched
    ? {
        type: "FeatureCollection",
        features: [
          ...obs.map((it) => {
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
