type eBirdTaxon = {
  speciesCode: string;
  sciName: string;
  category: string;
  reportAs?: string;
};

export async function sciNamesToCodes(sciNames: string[]): Promise<string[]> {
  const response = await fetch(
    `https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&cat=species,form&key=${process.env.EBIRD_API_KEY}`
  );
  // Forms that don't report as a species (e.g. undescribed forms) are treated as species
  const taxonomy: eBirdTaxon[] = (await response.json()).filter(
    (taxon: eBirdTaxon) => taxon.category === "species" || !taxon.reportAs
  );

  const bySciName = new Map(taxonomy.map((taxon) => [taxon.sciName, taxon.speciesCode]));

  return sciNames.map((name) => bySciName.get(name)).filter((code): code is string => !!code);
}
