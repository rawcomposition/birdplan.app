import * as React from "react";
import dayjs from "dayjs";

interface State {
  error: boolean;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
}

interface Props {
  lat: number | null;
  lng: number | null;
  radius: number;
  onCallback: (species: any[]) => void;
}

export default function useFetchSpecies({ lat, lng, radius, onCallback }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
  });

  const callbackRef = React.useRef(onCallback);

  const call = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false }));
    callbackRef.current([]);
    try {
      const response = await fetch(`/api/fetch?lat=${lat}&lng=${lng}&radius=${radius}`);
      const species = await response.json();
      if (!Array.isArray(species)) {
        callbackRef.current([]);
        setState((current) => ({ ...current, loading: false, error: true }));
      } else {
        callbackRef.current(species);
        setState({ lastUpdate: dayjs(), loading: false, error: false });
      }
    } catch (error) {
      callbackRef.current([]);
      console.error(error);
      setState((current) => ({ ...current, loading: false, error: true }));
    }
  }, [lat, lng, radius]);

  return { ...state, call };
}
