import React from "react";
import dayjs from "dayjs";
import { EbirdHotspot } from "lib/types";

interface State {
  error: boolean;
  loading: boolean;
  hotspots: EbirdHotspot[];
}

type Props = {
  region: string;
  fetchImmediately?: boolean;
};

export default function useFetchHotspots({ region, fetchImmediately = true }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    hotspots: [],
  });

  const call = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const res = await fetch(`https://api.ebird.org/v2/ref/hotspot/${region}?fmt=json`);

      const data: EbirdHotspot[] = await res.json();

      setState({ loading: false, error: false, hotspots: data });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: true, hotspots: [] }));
    }
  }, [region]);

  React.useEffect(() => {
    if (fetchImmediately) call();
  }, [call, fetchImmediately]);

  return { ...state, call };
}
