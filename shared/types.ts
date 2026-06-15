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
  customLifelist?: string[] | null; // the trip's effective list; null/absent ⇒ use the user's global list. In "shared" mode this holds the computed intersection of `intersectionLists`.
  customLifelistUpdatedAt?: string | null;
  intersectionLists?: IntersectionList[]; // when non-empty, the trip is in "shared" mode and customLifelist is their intersection

  targetStars?: string[];
  targetNotes?: {
    [key: string]: string;
  };
  shareCode?: string;
  shareCodeCreatedAt?: string;
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
  checklists?: number;
  notes?: string;
  favs?: HotspotFav[];
};

export type Profile = {
  _id: string;
  uid: string;
  name?: string;
  email?: string;
  lifelist: string[]; // the user's global life list (eBird species codes, deduped)
  lifelistUpdatedAt?: Date | null; // when the global list was last imported
  exceptions?: string[];
  dismissedNoticeId?: string;
  lastActiveAt: Date | null;
  resetToken?: string;
  resetTokenExpires?: Date;
};

// A named source list contributing to a trip's intersection ("shared") life list.
// A species is "seen" by the group only if it appears in every list, so the trip's
// effective customLifelist is the intersection of all of these lists' codes.
export type IntersectionList = {
  _id: string;
  name: string;
  codes: string[];
  updatedAt: string;
};

// Importing a life list (global or per-trip) from an eBird CSV export.
export type LifelistImportInput = {
  sciNames: string[];
};

// Adding a named source list to a trip's intersection ("shared") life list.
export type AddIntersectionListInput = {
  name: string;
  sciNames: string[];
};

// Replacing one intersection source list's species (a re-upload).
export type UpdateIntersectionListInput = {
  sciNames: string[];
};

// Renaming one intersection source list.
export type RenameIntersectionListInput = {
  name: string;
};

// Marking a single species seen (adds to a life list).
export type AddToLifelistInput = {
  code: string;
};

export type Target = {
  code: string;
  name: string;
  frequency: number;
  obs?: number[];
};

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

export type TripShareTokenType = "openbirding";

export type TripShareToken = {
  _id: string;
  tripId: string;
  type: TripShareTokenType;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TripInput = {
  name: string;
  region: string;
  startMonth: number;
  endMonth: number;
};

export type TripUpdateInput = {
  name: string;
  region: string;
  startMonth: number;
  endMonth: number;
};

export type Editor = {
  uid: string;
  name: string;
  lifelist: string[];
};

export type eBirdHotspot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species: number;
  checklists: number;
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

export type MarkerUpdateInput = {
  name: string;
  lat: number;
  lng: number;
  icon: string;
};

export type HotspotInput = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  species: number;
  checklists: number;
};

export type HotspotNotesInput = {
  notes: string;
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

export type RegionTz = {
  code: string;
  tz: string | null;
  subregions?: RegionTz[];
};

// OpenBirding API response types

export type OpenBirdingRegionTarget = {
  code: string;
  name: string;
  sciName?: string;
  frequency: number;
  obs: number[];
};

export type OpenBirdingRegionResponse = {
  items: OpenBirdingRegionTarget[];
  samples: number[];
  citation: string;
  queryTime: string;
};

export type OpenBirdingLocationTarget = {
  code: string;
  name: string;
  obs: number[];
};

export type OpenBirdingLocationResponse = {
  items: OpenBirdingLocationTarget[];
  samples: number[];
  citation: string;
  queryTime: string;
};

export type OpenBirdingHotspotRanking = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  frequency: number;
  samples: number;
  score?: number;
};

export type OpenBirdingHotspotRankingResponse = {
  items: OpenBirdingHotspotRanking[];
  citation: string;
  queryTime: string;
};
