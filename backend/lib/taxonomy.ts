type eBirdTaxon = {
  speciesCode: string;
  sciName: string;
};

export async function sciNamesToCodes(sciNames: string[]): Promise<string[]> {
  const response = await fetch(
    `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species&key=${process.env.EBIRD_API_KEY}`
  );
  const taxonomy: eBirdTaxon[] = await response.json();

  const bySciName = new Map(taxonomy.map((taxon) => [taxon.sciName, taxon.speciesCode]));

  return sciNames.map((name) => bySciName.get(name)).filter((code): code is string => !!code);
}
