import React from "react";
import { eBirdHotspot } from "lib/types";
import { getMarkerColorIndex } from "lib/helpers";
import { useTrip } from "providers/trip";
import { useQuery } from "@tanstack/react-query";

export default function useFetchHotspots(showHotspots: boolean) {
  const { trip, locations } = useTrip();
  const region = trip?.region;

  const { data } = useQuery<eBirdHotspot[]>({
    queryKey: [`/api/hotspots/${region}`],
    enabled: !!region && showHotspots,
    meta: {
      errorMessage: "Failed to load hotspots",
      showLoading: true,
    },
  });

  const hotspots = data || [];

  const hotspotsRef = React.useRef<eBirdHotspot[]>([]);
  hotspotsRef.current = hotspots;
  const hasFetched = hotspots.length > 0;

  const layer = React.useMemo(() => {
    if (!hasFetched) return null;
    const savedIds = locations?.map((it) => it.ebirdId) || [];
    const layerHotspots = hotspotsRef.current.filter((it) => !savedIds.includes(it.ebirdId));
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
              id: hotspot.ebirdId,
            },
          };
        }),
      ],
    };
  }, [locations, hasFetched]);

  return { hotspots, hotspotLayer: layer };
}
