export type Profile = {
  lifelist: string[];
  countryLifelist: string[];
  radius: number;
  address?: Address;
  enableExperimental?: boolean;
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
  originalName?: string;
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
  userIds: string[];
  ownerId: string;
  name: string;
  region: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  hotspots: Hotspot[];
  markers: CustomMarker[];
  startMonth: number;
  endMonth: number;
  timezone: string;
};

export type TripInput = Omit<Trip, "id" | "userIds" | "ownerId">;

export type Observation = {
  checklistId: string;
  count: number;
  date: string;
  evidence: "N" | "P" | "A";
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

export type Invite = {
  id: string;
  email: string;
  tripId: string;
  ownerId: string;
  accepted: boolean;
  name?: string;
  uid?: string;
};

export type LocationValue = {
  label: string;
  lat: number;
  lng: number;
};

export type RecentChecklist = {
  locId: string;
  subId: string;
  userDisplayName: string;
  numSpecies: number;
  obsDt: string;
  obsTime: string;
  subID: string;
  loc: {
    locId: string;
    name: string;
    latitude: number;
    longitude: number;
    countryCode: string;
    countryName: string;
    subnational1Name: string;
    subnational1Code: string;
    subnational2Code: string;
    subnational2Name: string;
    isHotspot: boolean;
    locName: string;
    lat: number;
    lng: number;
    hierarchicalName: string;
    locID: string;
  };
};

// BF: Bird Finder

export type BFTarget = {
  code: string;
  name: string;
  percent: number;
  id: string;
};

export type BFHotspot = {
  locationId: string;
  name: string;
  sampleSize: number;
  percent: number;
};
