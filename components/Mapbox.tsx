import React from "react";
import Map, { NavigationControl, Marker, Source, Layer } from "react-map-gl";
import { Marker as MarkerT, Trip } from "lib/types";
import { markerColors, getLatLngFromBounds } from "lib/helpers";
import MarkerIcon from "icons/HotspotMarker";

type Props = {
  bounds: Trip["bounds"];
  markers: MarkerT[];
  hotspotLayer: any;
  obsLayer: any;
  onHotspotClick: (id: string) => void;
};

export default function Mapbox({ bounds, markers, onHotspotClick, hotspotLayer, obsLayer }: Props) {
  const [satellite, setSatellite] = React.useState(false);

  const hsLayerStyle = {
    id: "hotspots",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-stroke-width": 0.75,
      "circle-stroke-color": "#555",
      "circle-color": [
        "match",
        ["get", "shade"],
        0,
        markerColors[0],
        1,
        markerColors[1],
        2,
        markerColors[2],
        3,
        markerColors[3],
        4,
        markerColors[4],
        5,
        markerColors[5],
        6,
        markerColors[6],
        7,
        markerColors[7],
        8,
        markerColors[8],
        9,
        markerColors[9],
        markerColors[0],
      ],
    },
  };

  const obsLayerStyle = {
    id: "obs",
    type: "circle",
    paint: {
      "circle-radius": 5,
      "circle-stroke-width": 0.75,
      "circle-stroke-color": "#555",
      "circle-color": ["match", ["get", "isPersonal"], "true", "#555", "#ce0d02"],
    },
  };

  const activeLayers = [hotspotLayer && "hotspots", obsLayer && "obs"].filter(Boolean);
  const { lat, lng } = getLatLngFromBounds(bounds);
  if (!lat || !lng) return null;

  return (
    <div className="relative w-full h-full">
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={satellite ? "mapbox://styles/mapbox/satellite-streets-v11" : "mapbox://styles/mapbox/outdoors-v11"}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_KEY}
        interactiveLayerIds={activeLayers}
        onMouseLeave={(e) => {
          e.target.getCanvas().style.cursor = "";
        }}
        onMouseEnter={(e) => {
          e.target.getCanvas().style.cursor = "pointer";
        }}
        onClick={(e) => {
          const features = e.target.queryRenderedFeatures(e.point, { layers: activeLayers });
          if (features.length) {
            onHotspotClick(features?.[0]?.properties?.id);
          }
        }}
        // @ts-ignore
        bounds={[
          [bounds.minX, bounds.minY],
          [bounds.maxX, bounds.maxY],
        ]}
      >
        <NavigationControl showCompass={false} />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={() => onHotspotClick(marker.id)}
          >
            <MarkerIcon
              className="w-[24px] h-[32px] -mt-[10px] cursor-pointer"
              color={markerColors[marker.shade || 0]}
              showStroke
              lightIcon={!!marker?.shade && (marker?.shade > 5 || marker?.shade < 2)}
            />
          </Marker>
        ))}
        {hotspotLayer && (
          <Source id="my-data" type="geojson" data={hotspotLayer}>
            {/* @ts-ignore */}
            <Layer {...hsLayerStyle} />
          </Source>
        )}
        {obsLayer && (
          <Source id="my-data" type="geojson" data={obsLayer}>
            {/* @ts-ignore */}
            <Layer {...obsLayerStyle} />
          </Source>
        )}
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
      {obsLayer && (
        <div className="flex absolute bottom-0 left-0 bg-white/90 py-1.5 pl-2 pr-3 text-xs items-center gap-2 z-50 rounded-tr-sm">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#555]" /> Personal Location
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ce0d02]" /> Hotspot
          </span>
        </div>
      )}
    </div>
  );
}
