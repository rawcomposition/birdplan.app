import React from "react";
import dayjs from "dayjs";
import { Hotspot } from "lib/types";
import { getMarkerColorIndex } from "lib/helpers";

interface State {
  error: boolean;
  loading: boolean;
  hotspots: Hotspot[];
}

type Props = {
  region: string;
  fetchImmediately?: boolean;
  savedIdStr: string;
};

export default function useFetchHotspots({ region, savedIdStr, fetchImmediately = true }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    hotspots: [],
  });
  const hotspotsRef = React.useRef<Hotspot[]>([]);
  hotspotsRef.current = state.hotspots;
  const hasFetched = state.hotspots.length > 0;

  const call = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const res = await fetch(`/api/hotspots/${region}`);
      const data: Hotspot[] = await res.json();

      setState({ loading: false, error: false, hotspots: data });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, hotspots: [] }));
    }
  }, [region]);

  React.useEffect(() => {
    if (fetchImmediately) call();
  }, [call, fetchImmediately]);

  const layer = React.useMemo(() => {
    if (!hasFetched) return null;
    const savedIds = savedIdStr.split(",");
    const layerHotspots = hotspotsRef.current.filter((it) => !savedIds.includes(it.id));
    return {
      type: "FeatureCollection",
      features: [
        ...layerHotspots.map((hotspot) => {
          const colorIndex = getMarkerColorIndex(hotspot.species);
          return {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [hotspot.lng, hotspot.lat],
            },
            properties: {
              shade: colorIndex,
              id: hotspot.id,
            },
          };
        }),
      ],
    };
  }, [savedIdStr, hasFetched]);

  return { ...state, layer, call };
}
