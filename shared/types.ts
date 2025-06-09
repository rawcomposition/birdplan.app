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
