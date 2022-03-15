import * as React from "react";
import { truncate } from "../helpers";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function Home() {
	const [species, setSpecies] = React.useState([]);
	const [expanded, setExpanded] = React.useState([]);
	const region = "US-OH";

	React.useEffect(() => {
		const fetchSightings = async () => {
			const response = await fetch(`https://api.ebird.org/v2/data/obs/${region}/recent/notable?detail=full&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`);
			const json = await response.json();

			//For unknown reasons, eBird sometimes returns duplicates
			const unique = json?.filter((value, index, array) => array.findIndex(searchItem => (searchItem.obsId === value.obsId)) === index);

			const structuredResults = {};

			unique?.map(item => {
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
	}, [region]);

	const handleToggle = (code) => {
		if (expanded.includes(code)) {
			setExpanded(current => current.filter(value => value !== code));
		} else {
			setExpanded(current => [...current, code]);
		}
	}

	return (
		<div className="container mx-auto max-w-xl">
			<h1 className="text-3xl font-bold text-center my-8">
      			Rare Birds for {region}
    		</h1>
			{species?.map(({name, code, reports}) => {
				const date = reports[0].obsDt;
				const isExpanded = expanded.includes(code);
				return (
					<article key={code} className="mb-4 rounded-sm shadow-sm bg-white px-8 py-6">
						<header className="flex justify-between">
							<h3 className="font-bold text-lg mb-4">{name}</h3>
							<div>
								<time dateTime={date} className="bg-gray-300 rounded-sm ml-4 px-2 py-1 text-xs">{dayjs(date).fromNow()}</time>
							</div>
						</header>
						
						<hr/>
						{isExpanded && <ul>
							{reports?.map(({locName, subnational2Name, subnational1Name, subId, obsId, obsDt, userDisplayName, lat, lng}) => (
								<li key={obsId + userDisplayName} className="my-4 rounded-sm bg-white">
									<h4 className="text-orange-900">
										{truncate(locName, 32)}, {subnational2Name}, {subnational1Name}
									</h4>
									<span className="text-gray-700 text-sm">{dayjs(obsDt).fromNow()} by {userDisplayName}</span>
									<br/>
									<a href={`https://ebird.org/checklist/${subId}`}>View Checklist</a> | <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}>Directions</a>
								</li>
							))}
						</ul>}
						<hr className="mb-4"/>
						<button type="button" className="inline-flex justify-center py-1 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500" onClick={() => handleToggle(code)}>{isExpanded ? "Hide" : "Show"} {reports.length} {reports.length === 1 ? "Report" : "Reports"}</button>
					</article>
				)
			})}
		</div>
	)
}