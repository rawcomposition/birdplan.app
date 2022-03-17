import * as React from "react";
import Sidebar from "../components/sidebar";
import SpeciesList from "../components/species-list";
import { postProcessSpecies } from "../helpers";
import reducer from "../reducer";
import { useUser } from "../providers/user";
import { saveSeenSpecies, fetchSeenSpecies } from "../firebase";
import useSyncLocalhost from "../hooks/use-sync-localhost";
import LocationSelect from "../components/location-select";

export default function Home() {
	const [state, dispatch] = React.useReducer(reducer, {
		species: [],
		expanded: [],
		seen: [],
		showSeen: false,
		radius: 50,
		address: {
			label: "Akron, OH",
			lat: 41.0843458,
			lng: -81.5830169,
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

	React.useEffect(() => {
		const fetchSightings = async () => {
			const response = await fetch(`http://localhost:3000/api/fetch?lat=${lat}&lng=${lng}&radius=${radius}`);
			const species = await response.json();
			dispatch({ type: "set_species", payload: species }); 
		}
		fetchSightings();
	}, [lat, lng, radius]);

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

	const filteredSpecies = postProcessSpecies({species, expanded, seen, showSeen});

	return (
		<div className="flex h-screen">
			<Sidebar seenCount={seen?.length} filters={{ showSeen, radius }} onFilterChange={handleFilterChange}/>
			<div className="container mx-auto max-w-xl">
				<h1 className="text-3xl font-bold text-center my-8">
					Rare Birds Near Me
				</h1>

				<LocationSelect className="w-full" value={address} onChange={handleAddressChange}/>

				<br/>
				<SpeciesList items={filteredSpecies} onToggle={handleToggle} onSeen={handleSeen}/> 
			</div>
		</div>
	)
}