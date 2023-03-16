import React from "react";
import toast from "react-hot-toast";

type Obs = {
  id: string;
  lat: number;
  lng: number;
  isPersonal: boolean;
};

type State = {
  error: boolean;
  loading: boolean;
  obs: Obs[];
};

type Props = {
  region: string;
  code?: string;
};

export default function useFetchSpeciesObs({ region, code }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    obs: [],
  });
  const obsRef = React.useRef<Obs[]>([]);
  obsRef.current = state.obs;
  const hasFetched = state.obs.length > 0;

  React.useEffect(() => {
    if (!region || !code) return;
    (async () => {
      setState((current) => ({ ...current, loading: true, error: false, species: [] }));
      try {
        const res = await fetch(
          `https://api.ebird.org/v2/data/obs/${region}/recent/${code}?key=${process.env.NEXT_PUBLIC_EBIRD_KEY}&back=30&includeProvisional=true`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        const obs: Obs[] = data.map(({ lat, lng, locId, locationPrivate, locName }: any) => ({
          lat,
          lng,
          id: locId,
          name: locName,
          isPersonal: locationPrivate,
        }));

        setState({ loading: false, error: false, obs });
      } catch (error) {
        setState((current) => ({ ...current, loading: false, error: true, hotspots: [] }));
        toast.error("Failed to species observations");
      }
    })();
  }, [region, code]);

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
              },
            };
          }),
        ],
      }
    : null;

  return { ...state, obsLayer: layer };
}
