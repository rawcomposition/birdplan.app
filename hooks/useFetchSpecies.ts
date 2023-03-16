import React from "react";
import dayjs from "dayjs";
import { Species } from "lib/types";

interface State {
  error: boolean;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
  species: Species[];
}

interface Props {
  lat: number | null;
  lng: number | null;
  radius: number;
}

export default function useFetchSpecies({ lat, lng, radius }: Props) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
    species: [],
  });

  const call = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const response = await fetch(`/api/fetch?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (!response.ok) throw new Error();
      const species = await response.json();
      if (!Array.isArray(species)) {
        setState((current) => ({ ...current, loading: false, error: true, species: [] }));
      } else {
        setState({ lastUpdate: dayjs(), loading: false, error: false, species });
      }
    } catch (error) {
      console.error(error);
      setState((current) => ({ ...current, loading: false, error: true, species: [] }));
    }
  }, [lat, lng, radius]);

  return { ...state, call };
}
