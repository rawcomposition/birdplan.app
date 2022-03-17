import * as React from "react";
import Sidebar from "../components/sidebar";
import SpeciesList from "../components/species-list";
import { postProcessSpecies } from "../helpers";
import reducer from "../reducer";
import { useUser } from "../providers/user";
import { saveSeenSpecies, fetchSeenSpecies } from "../firebase";
import useSyncLocalhost from "../hooks/use-sync-localhost";
import LocationSelect from "../components/location-select";
import useFetchSpecies from "../hooks/use-fetch-species";

export default function Home() {
	const [state, dispatch] = React.useReducer(reducer, {
		species: [],
		expanded: [],
		seen: [],
		showSeen: false,
		radius: 50,
		address: {
			label: null,
			lat: null,
			lng: null,
		}
	});
	const { address, radius, species, expanded, seen, showSeen } = state;
	const { lat, lng } = address || {};

	const { user } = useUser();

	useSyncLocalhost(dispatch, showSeen, address, radius);

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
	}, [user?.uid]);

	const handleToggle = (code) => {
		dispatch({ type: "expand_toggle", payload: code }); 
	}

	const handleSeen = (code) => {
		dispatch({ type: "add_seen", payload: code });
		saveSeenSpecies([...seen, code]);
	}

	const handleAddressChange = React.useCallback((value) => {
		dispatch({ type: "set_address", payload: value });
	}, []);

	const handleFilterChange = (field, value) => {
		console.log(field, value); //TODO: Remove after testing
		dispatch({ type: "filter_change", payload: { field, value } });
	}

	const { loading, error, call } = useFetchSpecies({ lat, lng, radius, onFinished: (response) => {
		dispatch({ type: "set_species", payload: response })
	 }});

	 React.useEffect(() => {
		if (lat && lng) {
			call();
		}
	}, [lat, lng, radius, call]);

	const filteredSpecies = postProcessSpecies({species, expanded, seen, showSeen});

	return (
		<div className="flex h-screen">
			<Sidebar seenCount={seen?.length} filters={{ showSeen, radius }} onFilterChange={handleFilterChange}/>
			<div className="h-screen overflow-auto grow">
				<div className="container mx-auto max-w-xl">
					<h1 className="text-3xl font-bold text-center my-8">
						Rare Birds Near Me
					</h1>

					<LocationSelect className="w-full" value={address} onChange={handleAddressChange}/>

					<br/>

					{error && <div>Error fetching data</div>}
					{loading && <div>loading...</div>}

					<SpeciesList items={filteredSpecies} onToggle={handleToggle} onSeen={handleSeen} lat={lat} lng={lng}/> 
				</div>
			</div>
		</div>
	)
}