import { distanceBetween } from "../../helpers";

export default async function handler(req, res) {
	const { lat, lng, radius = 50 } = req.query;
	const country = "US-OH"; //TODO: Change to US after testing is complete

	const response = await fetch(`https://api.ebird.org/v2/data/obs/${country}/recent/notable?detail=full&key=${process.env.EBIRD_KEY}`);
	let reports = await response.json();

	if (!reports?.length) {
		res.status(200).json([]);
	}
	
	reports = reports
		//Remove duplicates. For unknown reasons, eBird sometimes returns duplicates
		.filter((value, index, array) => array.findIndex(searchItem => (searchItem.obsId === value.obsId)) === index)
		.map(item => {
			const distance = parseFloat(distanceBetween(lat, lng, item.lat, item.lng).toFixed(2));
			return { ...item, distance };
		})
		.filter(({distance, comName}) => distance <= parseInt(radius) && ! comName.includes("(hybrid)"))
		.map(item => ({...item, distance: parseInt(item.distance)}));

	const reportsBySpecies = {};

	reports.forEach(item => {
		if (!reportsBySpecies[item.speciesCode]) {
			reportsBySpecies[item.speciesCode] = {
				name: item.comName,
				sciName: item.sciName,
				code: item.speciesCode,
				reports: [],
			};
		}
		reportsBySpecies[item.speciesCode].reports.push(item);
	});

	const species = Object.entries(reportsBySpecies).map(([key, value]) => value);

	res.status(200).json([...species]);
}
