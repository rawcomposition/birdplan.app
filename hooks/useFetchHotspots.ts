import React from "react";
import dayjs from "dayjs";
import { EbirdHotspot } from "lib/types";
import { getRadiusForBounds } from "lib/helpers";

interface State {
  error: boolean;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
  hotspots: EbirdHotspot[];
}

export default function useFetchHotspots() {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
    hotspots: [],
  });

  const call = React.useCallback(async (swLat: number, swLng: number, neLat: number, neLng: number) => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      // Calculate neccesary radius
      const centerLat = (swLat + neLat) / 2;
      const centerLng = (swLng + neLng) / 2;
      const bestRadius = getRadiusForBounds(swLat, swLng, neLat, neLng);
      const radius = Math.min(bestRadius, 500);

      const res = await fetch(
        `https://api.ebird.org/v2/ref/hotspot/geo?lat=${centerLat}8&lng=${centerLng}&dist=${radius}&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}&fmt=json`
      );

      const data: EbirdHotspot[] = await res.json();
      const containedHotspots = data.filter((hotspot: any) => {
        const { lat, lng } = hotspot;
        return lat > swLat && lat < neLat && lng > swLng && lng < neLng;
      });
      setState({ lastUpdate: dayjs(), loading: false, error: false, hotspots: containedHotspots });
    } catch (error) {
      console.error(error);
      setState((current) => ({ ...current, loading: false, error: true, hotspots: [] }));
    }
  }, []);

  return { ...state, call };
}
