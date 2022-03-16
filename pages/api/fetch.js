import { distanceBetween } from "../../helpers";

export default async function handler(req, res) {
	const { lat, lng, radius } = req.query;
	const country = "US-OH"; //TODO: Change to US after testing is complete

	const response = await fetch(`https://api.ebird.org/v2/data/obs/${country}/recent/notable?detail=full&key=${process.env.EBIRD_KEY}`);
	const json = await response.json();

	//For unknown reasons, eBird sometimes returns duplicates
	const unique = json?.filter((value, index, array) => array.findIndex(searchItem => (searchItem.obsId === value.obsId)) === index);

	const structuredResults = {};

	unique?.map(item => {
		const distance = parseInt(distanceBetween(lat, lng, item.lat, item.lng));
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

	res.status(200).json([...species])
}
