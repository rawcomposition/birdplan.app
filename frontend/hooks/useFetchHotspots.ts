import React from "react";
import { eBirdHotspot } from "lib/types";
import { getMarkerColorIndex } from "lib/helpers";
import { useTrip } from "providers/trip";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspots(showHotspots: boolean) {
  const { trip } = useTrip();
  const region = trip?.region;

  const { data } = useQuery<eBirdHotspot[]>({
    queryKey: [`/region/${region}/hotspots`],
    enabled: !!region && showHotspots,
    meta: {
      errorMessage: "Failed to load hotspots",
      showLoading: true,
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const hotspots = data || [];

  const hotspotsRef = React.useRef<eBirdHotspot[]>([]);
  hotspotsRef.current = hotspots;
  const hasFetched = hotspots.length > 0;

  const layer = React.useMemo(() => {
    if (!hasFetched) return null;
    const savedIds = trip?.hotspots?.map((it) => it.id) || [];
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
  }, [trip?.hotspots, hasFetched]);

  return { hotspots, hotspotLayer: layer };
}
