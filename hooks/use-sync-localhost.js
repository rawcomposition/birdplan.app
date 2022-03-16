import * as React from "react";

export default function useSyncLocalhost(dispatch, showSeen, address) {
	React.useEffect(() => {
		console.log("Initializing from localhost");

		const showSeen = window.localStorage.getItem("showSeen");
		const address = window.localStorage.getItem("address");

		if (showSeen === "false" || showSeen === "true") {
			dispatch({ type: "set_showSeen", payload: showSeen });
		}

		if (address) {
			dispatch({ type: "set_address", payload: JSON.parse(address) });
		}
	}, [dispatch]);

	React.useEffect(() => {
		window.localStorage.setItem("address",  JSON.stringify(address));
		window.localStorage.setItem("showSeen",  showSeen || []);
	});
}