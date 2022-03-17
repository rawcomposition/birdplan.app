import * as React from "react";
import dayjs from "dayjs";

export default function useFetchSpecies({lat, lng, radius, onCallback}) {
	const [state, setState] = React.useState({
		error: false,
		loading: false,
		lastUpdate: null,
	});

	const callbackRef = React.useRef(onCallback);

	const call = React.useCallback(async () => {
		setState(current => ({ ...current, loading: true, error: null }));
		callbackRef.current([]);
		try {
			const response = await fetch(`http://localhost:3000/api/fetch?lat=${lat}&lng=${lng}&radius=${radius}`);
			const species = await response.json();
			if (!Array.isArray(species)) {
				callbackRef.current([]);
				setState(current => ({ ...current, loading: false, error: true }));
			} else {
				callbackRef.current(species);
				setState({ lastUpdate: dayjs(), loading: false, error: false });
			}
		} catch (error) {
			callbackRef.current([]);
			console.error(error);
			setState(current => ({ ...current, loading: false, error: true }));
		}
	}, [lat, lng, radius]);

	return { ...state, call };
}
