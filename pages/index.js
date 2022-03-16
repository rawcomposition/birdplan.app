import * as React from "react";
import Sidebar from "../components/sidebar";
import SpeciesList from "../components/species-list";
import { distanceBetween, states as allStates } from "../helpers";
import Select from "react-select";
import reducer from "../reducer";
import { useUser } from "../providers/user";
import { saveSeenSpecies, fetchSeenSpecies } from "../firebase";

export default function Home() {
	const [state, dispatch] = React.useReducer(reducer, {
		species: [],
		expanded: [],
		seen: [],
		states: [],
	});
	const { species, expanded, seen, states } = state;
	const region = "US-OH";
	const myLat = 41.1508759;
	const myLng = -81.5139457;

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
	}, [user?.uid]);

	React.useEffect(() => {
		const states = window.localStorage.getItem("states");
		
		if (states) {
			dispatch({ type: "set_states", payload: JSON.parse(states) });
		}
	}, []);

	React.useEffect(() => {
		window.localStorage.setItem("states",  JSON.stringify(states) || []);
	}, [states]);

	React.useEffect(() => {
		const fetchSightings = async () => {
			const response = await fetch(`https://api.ebird.org/v2/data/obs/${region}/recent/notable?detail=full&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`);
			const json = await response.json();

			//For unknown reasons, eBird sometimes returns duplicates
			const unique = json?.filter((value, index, array) => array.findIndex(searchItem => (searchItem.obsId === value.obsId)) === index);

			const structuredResults = {};

			unique?.map(item => {
				const distance = parseInt(distanceBetween(myLat, myLng, item.lat, item.lng));
				item = {...item, distance}
				if (!structuredResults[item.speciesCode]) {
					structuredResults[item.speciesCode] = {
						name: item.comName,
						sciName: item.sciName,
						code: item.speciesCode,
						reports: [],
					};
				}
				structuredResults[item.speciesCode].reports.push(item);
			});

			const species = Object.entries(structuredResults).map(([key, value]) => value);

			dispatch({ type: "set_species", payload: species }); 
		}
		//fetchSightings();
	}, [region, myLat, myLng]);

	const handleToggle = (code) => {
		dispatch({ type: "expand_toggle", payload: code }); 
	}

	const handleSeen = (code) => {
		dispatch({ type: "add_seen", payload: code });
		saveSeenSpecies([...seen, code]);
	}

	const handleStateChange = (value) => {
		const values = value ? value.map(({value}) => value) : [];
		dispatch({ type: "set_states", payload: values });
	}

	const stateOptions = Object.entries(allStates).map((item) => ({ value: item[0], label: item[1] }));

	let stateValue = states;

	if (states?.length) {
		stateValue = states.length === 1 ? { label: allStates[states[0]], value: states[0] } : states.map(value => ({ value, label: states[value] }));
	}

	const filteredSpecies = species
		.filter(species => ! seen.includes(species.code))
		.map(species => ({...species, isExpanded: expanded.includes(species.code)}));

	return (
		<div className="flex h-screen">
			<Sidebar/>
			<div className="container mx-auto max-w-xl">
				<h1 className="text-3xl font-bold text-center my-8">
					Rare Birds
				</h1>

				<Select options={stateOptions} onChange={handleStateChange} value={stateValue} isMulti placeholder="Select states..."/>

				<br/>
				<SpeciesList items={filteredSpecies} onToggle={handleToggle} onSeen={handleSeen}/> 
			</div>
		</div>
	)
}