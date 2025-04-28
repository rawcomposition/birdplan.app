export type EBirdHotspotResult = {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
};

export type EBirdHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species?: number;
};
