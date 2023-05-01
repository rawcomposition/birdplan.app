export type Profile = {
  lifelist: string[];
  countryLifelist: string[];
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
  reports: RareObservation[];
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
  id: string;
  shade?: number;
};

export type EbirdHotspot = {
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

export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species?: number;
  notes?: string;
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
  targets: Target[];
  markers: CustomMarker[];
  startMonth: number;
  endMonth: number;
};

export type TripInput = Omit<Trip, "id" | "userId">;

export type Observation = {
  checklistId: string;
  count: number;
  date: string;
  evidence: "N";
};

export type Target = {
  code: string;
  name: string;
  percent: number;
};

export enum MarkerIcon {
  HOTSPOT = "hotspot",
  TENT = "tent",
  HOUSE = "house",
  AIRBNB = "airbnb",
  BINS = "bins",
  AIRPORT = "airport",
}

export type CustomMarker = {
  name: string;
  lat: number;
  lng: number;
  icon: MarkerIcon;
  id: string;
};

export type Option = {
  value: string;
  label: string;
};
