export default function usePostProcessSpecies({species, expanded, seen, showSeen}) {
	if (!species) {
		return { seenCount: 0, filteredSpecies: null };
	}
	let filteredSpecies = species;

	if (!showSeen) {
		filteredSpecies = species.filter(species => ! seen.includes(species.code));
	}

	filteredSpecies = filteredSpecies.map(species => ({...species, isExpanded: expanded.includes(species.code)}));

	const seenCount = species.filter(species => seen.includes(species.code)).length;

	return { seenCount, filteredSpecies };
}