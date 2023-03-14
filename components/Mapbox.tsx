import React from "react";
import Map, { NavigationControl, Marker, ViewStateChangeEvent, MapboxEvent } from "react-map-gl";
import { Marker as MarkerT, Bounds } from "lib/types";

type Props = {
  lat?: number;
  lng?: number;
  markers: MarkerT[];
  onSelect: (hotspot: MarkerT) => void;
  onMove: (bounds: Bounds) => void;
};

export default function Mapbox({ lat, lng, markers, onSelect, onMove }: Props) {
  const [satellite, setSatellite] = React.useState(false);

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    const bounds = e.target.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    onMove({ swLat: sw.lat, swLng: sw.lng, neLat: ne.lat, neLng: ne.lng });
  };

  const handleLoad = (e: MapboxEvent) => {
    const bounds = e.target.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    onMove({ swLat: sw.lat, swLng: sw.lng, neLat: ne.lat, neLng: ne.lng });
  };

  return (
    <div className="relative w-full h-full">
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: 8,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={satellite ? "mapbox://styles/mapbox/satellite-streets-v11" : "mapbox://styles/mapbox/outdoors-v11"}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
      >
        <NavigationControl showCompass={false} />
        {markers.map((marker) => (
          <Marker key={marker.id} latitude={marker.lat} longitude={marker.lng} onClick={() => onSelect(marker)}>
            <img src={`/markers/${marker.type}-${marker.shade || 1}.svg`} className="marker-sm" alt="marker" />
          </Marker>
        ))}
      </Map>
      <div className="flex gap-2 absolute top-2 left-2">
        <button
          type="button"
          className="bg-white shadow text-black rounded-sm px-4"
          onClick={() => setSatellite((prev) => !prev)}
        >
          {satellite ? "Terrain" : "Satellite"}
        </button>
      </div>
    </div>
  );
}