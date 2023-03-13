import * as React from "react";
import mapboxgl from "mapbox-gl";
import { getRadiusForBounds } from "lib/helpers";
import { getMarkerShade } from "lib/helpers";

const keys = process.env.NEXT_PUBLIC_MAPBOX_KEY?.split(",") || [];
const key = keys[Math.floor(Math.random() * keys.length)];
mapboxgl.accessToken = key || "";

type Props = {
  lat?: number;
  lng?: number;
};

export default function ExploreMap({ lat, lng }: Props) {
  const [satellite, setSatellite] = React.useState<boolean>(false);
  const mapContainer = React.useRef(null);
  const map = React.useRef<any>(null);
  const zoomRef = React.useRef<any>(6);
  const refs = React.useRef<any>(null);
  const tooLargeRef = React.useRef<boolean>(false);

  const fetchMarkers = async (swLat: number, swLng: number, neLat: number, neLng: number) => {
    const centerLat = (swLat + neLat) / 2;
    const centerLng = (swLng + neLng) / 2;
    const bestRadius = getRadiusForBounds(swLat, swLng, neLat, neLng);
    const radius = Math.min(bestRadius, 500);
    const res = await fetch(
      `https://api.ebird.org/v2/ref/hotspot/geo?lat=${centerLat}8&lng=${centerLng}&dist=${radius}&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}&fmt=json`
    );
    const data = await res.json();
    const containedHotspots = data.filter((hotspot: any) => {
      const { lat, lng } = hotspot;
      return lat > swLat && lat < neLat && lng > swLng && lng < neLng;
    });
    refs.current?.map((ref: any) => ref.remove());
    refs.current = containedHotspots.map(({ locName, locId, lat, lng, numSpeciesAllTime }: any) => {
      const icon = document.createElement("img");
      icon.className = "marker-sm";
      icon.src = `/markers/shade-${getMarkerShade(numSpeciesAllTime)}.svg`;

      const marker = new mapboxgl.Marker(icon);
      const targetUrl = `https://ebird.org/targets?r1=${locId}&bmo=1&emo=12&r2=world&t2=life`;
      const targetLink = `<a href="${targetUrl}" class="marker-link" target="_blank"><b>Targets</b></a>`;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3 class="font-medium text-sm mb-2">${locName}</h3>${targetLink}&nbsp;&nbsp;|&nbsp;&nbsp;<a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" class="marker-link"><b>Directions</b></a>`
      );
      marker.setLngLat([lng, lat]).setPopup(popup).addTo(map.current);

      return marker;
    });
  };

  const handleToggle = () => {
    const style = satellite ? "outdoors-v11" : "satellite-streets-v11";
    map.current.setStyle(`mapbox://styles/mapbox/${style}`);
    setSatellite((prev) => !prev);
  };

  React.useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v11",
      center: [lng || -95.7129, lat || 37.0902],
      zoom: 8,
    });
    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("moveend", () => {
      const newZoom = map.current.getZoom();
      if (newZoom < 7) return;
      const oldZoom = zoomRef.current;
      zoomRef.current = newZoom;
      if (newZoom > oldZoom && !tooLargeRef.current) return;
      const bounds = map.current.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      fetchMarkers(sw.lat, sw.lng, ne.lat, ne.lng);
    });

    const bounds = map.current.getBounds();
    fetchMarkers(
      bounds.getSouthWest().lat,
      bounds.getSouthWest().lng,
      bounds.getNorthEast().lat,
      bounds.getNorthEast().lng
    );
  });

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="flex gap-2 absolute top-2 left-2">
        <button type="button" className="bg-white shadow text-black rounded-sm px-4" onClick={handleToggle}>
          {satellite ? "Terrain" : "Satellite"}
        </button>
      </div>
    </div>
  );
}
