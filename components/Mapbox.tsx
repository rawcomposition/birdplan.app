import React from "react";
import Map, { NavigationControl, Marker, Source, Layer } from "react-map-gl";
import { Marker as MarkerT } from "lib/types";
import { markerColors } from "lib/helpers";
import MarkerIcon from "icons/Marker";

type Props = {
  lat?: number;
  lng?: number;
  markers: MarkerT[];
  hotspotLayer: any;
  onHotspotClick: (id: string) => void;
};

export default function Mapbox({ lat, lng, markers, onHotspotClick, hotspotLayer }: Props) {
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
        interactiveLayerIds={hotspotLayer && ["hotspots"]}
        onMouseLeave={(e) => {
          e.target.getCanvas().style.cursor = "";
        }}
        onMouseEnter={(e) => {
          e.target.getCanvas().style.cursor = "pointer";
        }}
        onClick={(e) => {
          const features = e.target.queryRenderedFeatures(e.point, { layers: ["hotspots"] });
          if (features.length) {
            onHotspotClick(features?.[0]?.properties?.id);
          }
        }}
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
              className="w-[15px] h-[20px] -mt-[10px] cursor-pointer"
              color={markerColors[marker.shade || 0]}
              showStroke
            />
          </Marker>
        ))}
        {hotspotLayer && (
          <Source id="my-data" type="geojson" data={hotspotLayer}>
            {/* @ts-ignore */}
            <Layer {...hsLayerStyle} />
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
    </div>
  );
}
