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
  // The next block is COMPUTED at read time by the trip resolver — never persisted.
  customLifelist?: string[] | null; // the GROUP's effective list (intersection of all participants); null ⇒ solo-World (fall back to the viewer's global list)
  customLifelistUpdatedAt?: string | null;
  lifelistMode?: TripLifelistMode; // the GROUP's mode (distinct from the viewer's own listMode)
  viewerLifelist?: string[] | null; // the requesting viewer's own effective list
  viewer?: { participantId: string; listMode: ParticipantListMode } | null; // the viewer's own participant row; null if not a participant / view-only

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

// Importing a life list (global or per-trip) from an eBird CSV export.
export type LifelistImportInput = {
  sciNames: string[];
};

// ---- Participants ----------------------------------------------------------
// One row per person on a trip. A registered user (has `uid`) contributes their live World
// list or a per-trip Custom upload; a named-only person (no `uid`) is always custom and the
// owner uploads their list. Replaces both the Invite collection and the old intersectionLists.
export type ParticipantStatus = "pending" | "active";
export type ParticipantListMode = "world" | "custom";
export type TripLifelistMode = "world" | "customSingle" | "customShared";

export type Participant = {
  _id: string;
  tripId: string;
  status: ParticipantStatus; // pending = email invite not yet accepted
  uid?: string; // registered user (owner + accepted invitees)
  email?: string; // email invite; redacted from non-editors in responses
  name?: string; // profile name, or free-text for named-only
  listMode: ParticipantListMode; // named-only is always "custom"
  lifelist: string[]; // this person's custom/trip list ([] for World and pending)
  lifelistUpdatedAt?: Date | null;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

// Roster metadata returned by GET /participants — no raw life lists.
export type ParticipantView = {
  _id: string;
  uid?: string;
  name?: string;
  email?: string; // present only when the requester is an editor/owner
  status: ParticipantStatus;
  listMode: ParticipantListMode;
  isOwner: boolean;
  isMe: boolean;
  count: number; // effective species count
};

export type AddParticipantInput =
  | { type: "invite"; email: string; upgradeId?: string }
  | { type: "named"; name: string; sciNames: string[] };

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
