import * as React from "react";

export default function useFetchSpecies({lat, lng, radius, onFinished}) {
	const [state, setState] = React.useState({
		error: false,
		loading: false,
	});

	const callbackRef = React.useRef(onFinished);

	const call = React.useCallback(async () => {
		setState({ loading: true, error: null });
		try {
			const response = await fetch(`http://localhost:3000/api/fetch?lat=${lat}&lng=${lng}&radius=${radius}`);
			const species = await response.json();
			if (!Array.isArray(species)) {
				callbackRef.current([]);
			} else {
				callbackRef.current(species);
			}
			setState({ loading: false, error: false });
		} catch (error) {
			callbackRef.current([]);
			console.error(error);
			setState({ loading: false, error: true });
		}
	}, [lat, lng, radius]);

	return { ...state, call };
}
