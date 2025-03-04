import { MarkerIconT } from "lib/icons";

export type Profile = {
  id: string;
  lifelist: string[];
  exceptions?: string[];
  radius: number;
  lat?: number;
  lng?: number;
  dismissedNoticeId?: string;
};

export type Marker = {
  lat: number;
  lng: number;
  id: string;
  shade?: number;
};

export enum LocationType {
  hotspot = "hotspot",
  custom = "custom",
}

export type Location = {
  _id: string;
  ebirdId?: string;
  type: LocationType;
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
  icon?: MarkerIconT;
  placeId?: string;
  placeType?: string;
};

export type LocationInput = {
  ebirdId?: string;
  name: string;
  lat: number;
  lng: number;
  type: LocationType;
};

export type eBirdHotspot = {
  ebirdId: string;
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

export type TravelData = {
  time: number;
  distance: number;
  method: "driving" | "walking" | "cycling";
  locationId: string; // Traveling from this location
  isDeleted?: boolean;
};

export type Day = {
  id: string;
  notes?: string;
  locations: {
    travel?: TravelData;
    locationId: string;
    type: "hotspot" | "marker";
    id: string;
  }[];
};

export type Trip = {
  _id: string;
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
  itinerary?: Day[];
  startDate?: string;
  startMonth: number;
  endMonth: number;
  timezone: string;
  imgUrl: string | null;
  targetStars?: string[];
  targetNotes?: {
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type TripInput = {
  name: string;
  region: string;
  startMonth: number;
  endMonth: number;
};

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

export enum TargetListType {
  trip = "trip",
  hotspot = "hotspot",
}

export type TargetList = {
  _id: string;
  type: TargetListType;
  tripId: string;
  hotspotId?: string;
  items: Target[];
  N: number;
  yrN: number;
  updatedAt: string;
  createdAt: string;
};

export type TargetListInput = {
  hotspotId?: string;
  items: Target[];
  N: number;
  yrN: number;
};

export type GooglePlaceT = {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
};
