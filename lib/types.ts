export type Profile = {
  id: string;
  lifelist: string[];
  countryLifelist: string[];
  radius: number;
  lat?: number;
  lng?: number;
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
  distance: number | null;
  isClosest: boolean;
  hasRichMedia: boolean;
};

export type Species = {
  name: string;
  code: string;
  abaCode?: number;
  imgUrl?: string;
  reports: RareObservation[];
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
  targetsId?: string;
  favs: {
    name: string;
    code: string;
    range: string;
    percent: number;
  }[];
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

export type Day = {
  id: string;
  locations: {
    locationId: string;
    type: "hotspot" | "marker";
  }[];
};

export type Trip = {
  id: string;
  userIds: string[];
  ownerId: string;
  ownerName: string;
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
  itinerary: Day[];
  startDate: string;
  startMonth: number;
  endMonth: number;
  timezone: string;
  imgUrl: string | null;
  createdAt: string;
};

export type TripInput = Omit<Trip, "id" | "userIds" | "ownerId" | "ownerName">;

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
  percentYr: number;
};

export enum MarkerIcon {
  HOTSPOT = "hotspot",
  TENT = "tent",
  HOUSE = "house",
  BOAT = "boat",
  AIRBNB = "airbnb",
  BINS = "bins",
  HIKE = "hike",
  AIRPORT = "airport",
}

export type CustomMarker = {
  name: string;
  lat: number;
  lng: number;
  icon: MarkerIcon;
  id: string;
  notes?: string;
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

export type RecentSpecies = {
  code: string;
  name: string;
  date: string;
  checklistId: string;
  count: number;
};

export type Targets = {
  items: Target[];
  N: number;
  yrN: number;
  tripId: string;
  hotspotId?: string;
  updatedAt?: string;
};
