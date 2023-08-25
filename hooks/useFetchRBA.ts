import React from "react";
import dayjs from "dayjs";
import { Species } from "lib/types";

interface State {
  error: boolean;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
  species: Species[];
}

export default function useFetchRBA() {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
    species: [],
  });

  const call = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const response = await fetch("/api/get-rba");
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
  }, []);

  return { ...state, call };
}
