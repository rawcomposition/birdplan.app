export type Trip = {
  _id: string;
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
  groupLifelist?: string[] | null;
  groupLifelistUpdatedAt?: string | null;
  isGroupTrip?: boolean;
  viewerLifelist?: string[] | null;
  viewer?: { participantId: string; listMode: ParticipantListMode } | null;

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
  lifelist: string[];
  lifelistUpdatedAt?: Date | null;
  exceptions?: string[];
  dismissedNoticeId?: string;
  lastActiveAt: Date | null;
  resetToken?: string;
  resetTokenExpires?: Date;
};

export type LifelistImportInput = {
  sciNames: string[];
};

export type ParticipantStatus = "pending" | "active";
export type ParticipantListMode = "world" | "custom";

export type Participant = {
  _id: string;
  tripId: string;
  status: ParticipantStatus;
  uid?: string;
  email?: string;
  name?: string;
  listMode: ParticipantListMode;
  lifelist: string[];
  lifelistUpdatedAt?: Date | null;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ParticipantView = {
  _id: string;
  uid?: string;
  name?: string;
  email?: string;
  status: ParticipantStatus;
  listMode: ParticipantListMode;
  isOwner: boolean;
  isMe: boolean;
  count: number;
  hasList: boolean;
};

export type AddParticipantInput =
  | { type: "invite"; email: string; upgradeId?: string; sciNames?: string[] }
  | { type: "named"; name: string; sciNames?: string[] };

export type UpdateParticipantInput = {
  name: string;
};

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
