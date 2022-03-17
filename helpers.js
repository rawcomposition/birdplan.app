export function truncate(string, length) {
	return string.length > length ? `${string.substring(0, length)}...` : string;
}

//Adapted from https://www.geodatasource.com/developers/javascript
export function distanceBetween(lat1, lon1, lat2, lon2, metric = true) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		const radlat1 = Math.PI * lat1/180;
		const radlat2 = Math.PI * lat2/180;
		const theta = lon1-lon2;
		const radtheta = Math.PI * theta/180;
		let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (metric) {
			dist = dist * 1.609344;
		}
		return parseFloat(dist);
	}
}

export function postProcessSpecies({species, expanded, seen, showSeen}) {
	let filteredSpecies = species;

	if (!showSeen) {
		filteredSpecies = species.filter(species => ! seen.includes(species.code));
	}

	return filteredSpecies.map(species => ({...species, isExpanded: expanded.includes(species.code)}));
}