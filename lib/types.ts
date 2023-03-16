export type Profile = {
  lifelist: string[];
  radius: number;
  address?: Address;
};

export type RareObservation = {
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
  lat: number;
  lng: number;
  type: string;
  id: string;
  shade?: number;
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

export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species?: number;
};

export type KeyValue = {
  [key: string]: any;
};

export type Bounds = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};

export type Trip = {
  id: string;
  userId: string;
  name: string;
  region: string;
  regionName: string;
  parentRegion?: string;
  parentRegionName?: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  hotspots: Hotspot[];
};

export type TripInput = Omit<Trip, "id" | "userId">;

export type Observation = {
  checklistId: string;
  count: number;
  date: string;
  evidence: "N";
};

export type Option = {
  value: string;
  label: string;
};
