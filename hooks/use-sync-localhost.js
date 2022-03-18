import * as React from "react";

export default function useSyncLocalhost(dispatch, showSeen, address, radius) {
	React.useEffect(() => {
		console.log("Initializing from localhost");

		const showSeen = window.localStorage.getItem("showSeen");
		const address = window.localStorage.getItem("address");
		const radius = window.localStorage.getItem("radius");

		if (showSeen === "false" || showSeen === "true") {
			dispatch({ type: "show_seen", payload: showSeen });
		}

		if (address) {
			dispatch({ type: "set_address", payload: JSON.parse(address) });
		}

		if (radius) {
			dispatch({ type: "set_radius", payload: radius });
		}

		dispatch({ type: "set_cacheRestored" });
	}, [dispatch]);

	React.useEffect(() => {
		window.localStorage.setItem("address",  JSON.stringify(address));
		window.localStorage.setItem("showSeen",  showSeen || []);
		window.localStorage.setItem("radius",  radius);
	});
}