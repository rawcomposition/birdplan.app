import * as React from "react";
import { truncate, distanceBetween, states } from "../helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import useLocalStorage from "../hooks/use-local-storage";
import Select from "react-select";

export default function Home() {
	const [species, setSpecies] = React.useState([]);
	const [expanded, setExpanded] = React.useState([]);
	const [seen, setSeen] = useLocalStorage("seenSpecies", []);
	const [selectedStates, setSelectedStates] = useLocalStorage("states", []);
	const region = "US-OH";
	const myLat = 41.1508759;
	const myLng = -81.5139457;

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
						code: item.speciesCode,
						reports: [],
					};
				}
				structuredResults[item.speciesCode].reports.push(item);
			});

			const species = Object.entries(structuredResults).map(([key, value]) => value);

			setSpecies(species);
		}
		fetchSightings();
	}, [region, myLat, myLng]);

	const handleToggle = (code) => {
		if (expanded.includes(code)) {
			setExpanded(current => current.filter(value => value !== code));
		} else {
			setExpanded(current => [...current, code]);
		}
	}

	const handleSeen = (code) => {
		setSeen([...seen, code]);
	}

	const handleStateChange = (value) => {
		const values = value ? value.map(({value}) => value) : [];
		setSelectedStates(values);
	}

	const filteredSpecies = species.filter(species => ! seen.includes(species.code));

	const stateOptions = Object.entries(states).map((item) => ({ value: item[0], label: item[1] }));

	const stateValue = selectedStates.map(value => ({ value, label: states[value] }));
	
	return (
		<div className="container mx-auto max-w-xl">
			<h1 className="text-3xl font-bold text-center my-8">
      			Rare Birds
    		</h1>

			<Select options={stateOptions} onChange={handleStateChange} value={stateValue} isMulti isClearable placeholder="Select states..."/>

			<br/>

			{filteredSpecies?.map(({name, code, reports}) => {
				const date = reports[0].obsDt;
				const isExpanded = expanded.includes(code);
				const distances = reports.map(({distance}) => distance);
				const shortestDistance = distances.sort((a, b) => (a - b)).shift();
				const distancesAllEqual = distances.every(value => value === distances[0])
				return (
					<article key={code} className="mb-4 rounded-sm shadow-sm bg-white px-8 py-6">
						<header className="flex justify-between">
							<h3 className="font-bold text-lg mb-4">{name}</h3>
							<div>
								<time dateTime={date} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs">{dayjs(date).fromNow()}</time>
								<span dateTime={date} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs">{shortestDistance} mi</span>
							</div>
						</header>
						
						<hr/>
						{isExpanded && <ul>
							{reports?.map(({locName, subnational2Name, subnational1Name, subId, obsId, obsDt, userDisplayName, lat, lng, distance}) => (
								<li key={obsId + userDisplayName} className="my-4 rounded-sm bg-white">
									<h4 className="text-orange-900">
										{truncate(locName, 32)}, {subnational2Name}, {subnational1Name}
									</h4>
									{(!distancesAllEqual && shortestDistance === distance) &&
										<>
											<span dateTime={date} className="bg-green-400 rounded-sm ml-4 px-2 py-1 text-xs">Closest</span>
											<br/>
										</>
									}
									<span className="text-gray-700 text-sm">{dayjs(obsDt).fromNow()} by {userDisplayName}</span>
									<br/>
									{distance} mi
									<br/>
									<a href={`https://ebird.org/checklist/${subId}`}>View Checklist</a> | <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}>Directions</a>
								</li>
							))}
						</ul>}
						<hr className="mb-4"/>
						<button type="button" className="inline-flex justify-center py-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" onClick={() => handleToggle(code)}>{isExpanded ? "Hide" : "Show"} {reports.length} {reports.length === 1 ? "Report" : "Reports"}</button>
						<button type="button" className="ml-2 inline-flex justify-center py-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" onClick={() => handleSeen(code)}>Seen</button>
					</article>
				)
			})}
		</div>
	)
}