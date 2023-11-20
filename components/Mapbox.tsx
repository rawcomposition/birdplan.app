import React from "react";
import Map, { NavigationControl, Marker, Source, Layer, GeolocateControl } from "react-map-gl";
import { Marker as MarkerT, Trip, MarkerIcon, CustomMarker } from "lib/types";
import { markerColors, getLatLngFromBounds } from "lib/helpers";
import MarkerWithIcon from "components/MarkerWithIcon";
import clsx from "clsx";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";

type Props = {
  bounds: Trip["bounds"];
  markers?: MarkerT[];
  customMarkers?: CustomMarker[];
  hotspotLayer?: any;
  obsLayer?: any;
  addingMarker?: boolean;
  onHotspotClick?: (id: string) => void;
  onDisableAddingMarker?: () => void;
};

export default function Mapbox({
  bounds,
  markers,
  customMarkers,
  onHotspotClick,
  hotspotLayer,
  obsLayer,
  addingMarker,
  onDisableAddingMarker,
}: Props) {
  const [satellite, setSatellite] = React.useState(false);
  const { open, close } = useModal();
  const { selectedMarkerId } = useTrip();
  const isOpeningModal = React.useRef(false);

  const handleHotspotClick = (id: string) => {
    isOpeningModal.current = true;
    onHotspotClick?.(id);
    setTimeout(() => {
      isOpeningModal.current = false;
    }, 500);
  };

  const handleMarkerClick = (marker: CustomMarker) => {
    isOpeningModal.current = true;
    open("viewMarker", { marker });
    setTimeout(() => {
      isOpeningModal.current = false;
    }, 500);
  };

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const hsLayerStyle = {
    id: "hotspots",
    type: "circle",
    paint: {
      "circle-radius": isMobile ? 8 : 7,
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
      "circle-radius": isMobile ? 8 : 7,
      "circle-stroke-width": 0.75,
      "circle-stroke-color": "#555",
      "circle-color": ["match", ["get", "isPersonal"], "true", "#555", "#ce0d02"],
    },
  };

  const activeLayers = [hotspotLayer && "hotspots", obsLayer && "obs"].filter(Boolean);
  const { lat, lng } = getLatLngFromBounds(bounds);
  if (!lat || !lng) return null;

  return (
    <div className={clsx("relative w-full h-full", addingMarker && "mapboxAddMarkerMode")}>
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
          if (addingMarker) {
            open("addMarker", { lat: e.lngLat.lat, lng: e.lngLat.lng });
            onDisableAddingMarker?.();
            return;
          }
          const features = e.target.queryRenderedFeatures(e.point, { layers: activeLayers });
          if (features.length) {
            handleHotspotClick(features?.[0]?.properties?.id);
          } else if (!isOpeningModal.current) {
            close();
          }
        }}
        // @ts-ignore
        bounds={[
          [bounds.minX, bounds.minY],
          [bounds.maxX, bounds.maxY],
        ]}
      >
        <NavigationControl showCompass={false} />
        <GeolocateControl positionOptions={{ enableHighAccuracy: true }} trackUserLocation={true} />
        {markers?.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={() => {
              handleHotspotClick(marker.id);
            }}
          >
            <MarkerWithIcon icon={MarkerIcon.HOTSPOT} highlight={marker.id === selectedMarkerId} />
          </Marker>
        ))}
        {customMarkers?.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={() => handleMarkerClick(marker)}
          >
            <MarkerWithIcon icon={marker.icon} highlight={marker.id === selectedMarkerId} />
          </Marker>
        ))}
        {hotspotLayer && (
          <Source id="hotspot-layer" type="geojson" data={hotspotLayer}>
            {/* @ts-ignore */}
            <Layer {...hsLayerStyle} />
          </Source>
        )}
        {obsLayer && (
          <Source id="obs-layer" type="geojson" data={obsLayer}>
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
        <div className="flex absolute bottom-0 left-0 bg-white/90 py-1.5 pl-2 pr-3 text-xs items-center gap-2 z-10 rounded-tr-sm">
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
