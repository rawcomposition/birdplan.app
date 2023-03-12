export type Observation = {
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

export interface RBAItem extends Species {
  isExpanded: boolean;
  isSeen: boolean;
  isPending: boolean;
}

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
