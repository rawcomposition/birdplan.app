import { TargetListType } from "./enums.js";

export type Trip = {
  _id: string;
  userIds: string[];
  ownerId: string;
  ownerName: string;
  isPublic: boolean;
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
  itinerary?: Day[];
  startDate?: string;
  startMonth: number;
  endMonth: number;
  imgUrl: string | null;
  targetStars?: string[];
  targetNotes?: {
    [key: string]: string;
  };
  updatedAt: string;
  createdAt: string;
};

export type CustomMarker = {
  name: string;
  lat: number;
  lng: number;
  icon: string;
  id: string;
  notes?: string;
  placeId?: string;
  placeType?: string;
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

export type TravelData = {
  time: number;
  distance: number;
  method: "driving" | "walking" | "cycling";
  locationId: string; // Traveling from this location
  isDeleted?: boolean;
};

export type HotspotFav = {
  name: string;
  code: string;
  range: string;
  percent: number;
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
  favs?: HotspotFav[];
};

export type Profile = {
  _id: string;
  uid: string;
  name?: string;
  email?: string;
  lifelist: string[];
  exceptions?: string[];
  dismissedNoticeId?: string;
  lastActiveAt: Date | null;
  resetToken?: string;
  resetTokenExpires?: Date;
};

export type Target = {
  code: string;
  name: string;
  percent: number;
  percentYr: number;
};

export type TargetList = {
  _id: string;
  type: TargetListType;
  tripId: string;
  items: Target[];
  N: number;
  yrN: number;
  hotspotId?: string;
  updatedAt: string;
  createdAt: string;
};

export type TargetListInput = Omit<TargetList, "_id" | "updatedAt" | "createdAt" | "type" | "tripId">;

export type eBirdTaxonomy = {
  sciName: string;
  comName: string;
  speciesCode: string;
  category: string;
  taxonOrder: number;
  bandingCodes: string[];
  comNameCodes: string[];
  sciNameCodes: string[];
  order: string;
  familyCode: string;
  familyComName: string;
  familySciName: string;
};

export type Invite = {
  _id: string;
  email: string;
  tripId: string;
  ownerId: string;
  accepted: boolean;
  name?: string;
  uid?: string;
};

export type InviteInput = {
  email: string;
  tripId: string;
};

export type TripInput = {
  name: string;
  region: string;
  startMonth: number;
  endMonth: number;
};

export type TripUpdateInput = {
  name: string;
  startMonth: number;
  endMonth: number;
};

export type Editor = {
  uid: string;
  name: string;
  lifelist: string[];
};

export type QuizImages = {
  _id: string;
  code: string;
  ids: string[];
  name: string;
};

export type Vault = {
  _id: string;
  key: string;
  value: string;
};

export type eBirdHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species: number;
};

export type SpeciesObservation = {
  code: string;
  name: string;
  date: string;
  checklistId: string;
  count: number;
};

export type TargetStarInput = {
  code: string;
};

export type TargetNotesInput = {
  code: string;
  notes: string;
};

export type MarkerInput = {
  id: string;
  lat: number;
  lng: number;
  notes?: string;
};

export type MarkerNotesInput = {
  notes: string;
};

export type HotspotInput = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom?: number;
  notes?: string;
  favs?: HotspotFav[];
};

export type HotspotNotesInput = {
  notes: string;
};

export type HotspotTargetListInput = {
  hotspotId: string;
  targets: string[];
};

export type SpeciesFavInput = {
  code: string;
};

export type TranslateNameResponse = {
  originalName: string;
  translatedName: string;
};

export type ItineraryDayInput = {
  id: string;
  date: string;
  notes?: string;
  locations?: ItineraryLocation[];
};

export type ItineraryNotesInput = {
  notes: string;
};

export type MoveLocationInput = {
  id: string;
  direction: "up" | "down";
};

export type RemoveLocationInput = {
  id: string;
};

export type AddLocationInput = {
  type: "hotspot" | "marker";
  locationId: string;
  id: string;
};

export type CalcTravelTimeInput = {
  id: string;
  method: "walking" | "driving" | "cycling";
};

export type ItineraryLocation = {
  id: string;
  type: "hotspot" | "marker";
  locationId: string;
  travel?: {
    method: "walking" | "driving" | "cycling";
    time: number;
    distance: number;
    locationId: string;
    isDeleted?: boolean;
  };
};
