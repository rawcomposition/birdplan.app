import * as React from "react";
import { useUser } from "../providers/user";

export default function useFetchSeenSpecies({dispatch}) {
	const { user } = useUser();
	React.useEffect(() => {
	
		const getData = async () => {
			const seen = await fetchSeenSpecies();
			if (seen.length) {
				dispatch({ type: "set_seen", payload: seen || [] });
			}
		}
		if (user?.uid) {
			getData();
		}
	}, [user?.uid, dispatch]);
}