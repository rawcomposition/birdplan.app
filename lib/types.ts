export type Profile = {
  lifelist: string[];
  radius: number;
  address?: Address;
};

export type Observation = {
  locName: string;
  subnational2Name: string;
  subnational1Name: string;
  subId: string;
  obsId: string;
  obsDt: string;
  userDisplayName: string;
  lat: number;
  lng: number;
  distance: number;
  isClosest: boolean;
  hasRichMedia: boolean;
};

export type Species = {
  name: string;
  sciName: string;
  code: string;
  reports: Observation[];
};

export type Address = {
  label: string;
  lat: number;
  lng: number;
};

export type State = {
  species: Species[];
  expanded: string[];
  seen: string[];
  pending: string[];
  showSeen: boolean;
  radius: number;
  isCacheRestored: boolean;
  showSidebar: boolean;
  address?: Address;
};

export type DispatchAction = {
  type: string;
  payload?: any;
};

export type Marker = {
  name: string;
  lat: number;
  lng: number;
  type: string;
  id: string;
  species?: number;
};

export type EbirdHotspot = {
  locId: string;
  locName: string;
  countryCode: "MX";
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
};

export type KeyValue = {
  [key: string]: any;
};
