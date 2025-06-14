import { MarkerIconT } from "lib/icons";

export type Marker = {
  lat: number;
  lng: number;
  id: string;
  shade?: number;
};

export type CustomMarker = {
  name: string;
  lat: number;
  lng: number;
  icon: MarkerIconT;
  id: string;
  notes?: string;
  placeId?: string;
  placeType?: string;
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

export type Option = {
  value: string;
  label: string;
};

export type RecentChecklist = {
  locId: string;
  subId: string;
  userDisplayName: string;
  numSpecies: number;
  isoObsDate: string;
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

export type Observation = {
  checklistId: string;
  count: number;
  date: string;
  evidence: "N" | "P" | "A";
};

export type GooglePlaceT = {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  type?: string;
};

export type RegionTz = {
  code: string;
  tz: string | null;
  subregions?: RegionTz[];
};
