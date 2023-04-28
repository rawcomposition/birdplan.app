import React from "react";
import { Hotspot } from "lib/types";
import { getMarkerColorIndex } from "lib/helpers";
import toast from "react-hot-toast";

type State = {
  error: boolean;
  loading: boolean;
  hotspots: Hotspot[];
};

type Props = {
  region?: string;
  savedIdStr: string;
};

export default function useFetchHotspots({ region, savedIdStr }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    hotspots: [],
  });
  const hotspotsRef = React.useRef<Hotspot[]>([]);
  hotspotsRef.current = state.hotspots;
  const hasFetched = state.hotspots.length > 0;

  const call = React.useCallback(async () => {
    if (!region) return;
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    const toastId = toast.loading("Fetching hotspots...");
    try {
      const res = await fetch(`/api/hotspots/${region}`);
      if (!res.ok) throw new Error();
      const data: Hotspot[] = await res.json();

      setState({ loading: false, error: false, hotspots: data });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, hotspots: [] }));
      toast.error("Failed to fetch hotspots");
    }
    toast.dismiss(toastId);
  }, [region]);

  const layer = React.useMemo(() => {
    if (!hasFetched) return null;
    const savedIds = savedIdStr.split(",");
    const layerHotspots = hotspotsRef.current.filter((it) => !savedIds.includes(it.id));
    return {
      type: "FeatureCollection",
      features: [
        ...layerHotspots.map((hotspot) => {
          const colorIndex = getMarkerColorIndex(hotspot.species || 0);
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

  return { ...state, hotspotLayer: layer, call };
}
