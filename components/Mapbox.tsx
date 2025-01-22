import React from "react";
import Map, { Marker, Source, Layer, GeolocateControl, MapRef } from "react-map-gl";
import { Marker as MarkerT, Trip, CustomMarker } from "lib/types";
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
  showSatellite?: boolean;
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
  showSatellite,
  onDisableAddingMarker,
}: Props) {
  const { open, close } = useModal();
  const { selectedMarkerId, halo } = useTrip();
  const isOpeningModal = React.useRef(false);
  const mapRef = React.useRef<MapRef | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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
    <div ref={containerRef} className={clsx("relative w-full h-full", addingMarker && "mapboxAddMarkerMode")}>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          showSatellite ? "mapbox://styles/mapbox/satellite-streets-v11" : "mapbox://styles/mapbox/outdoors-v11"
        }
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
            const lat = Math.round(e.lngLat.lat * 1000000) / 1000000;
            const lng = Math.round(e.lngLat.lng * 1000000) / 1000000;
            open("addMarker", { lat, lng });
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
        ref={mapRef}
      >
        <GeolocateControl
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          position="bottom-right"
          style={{
            borderRadius: "50%",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            border: "none",
            padding: 0,
            color: "#374151",
            marginRight: "1rem",
            marginBottom: "1rem",
          }}
        />
        {markers?.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleHotspotClick(marker.id);
            }}
          >
            <MarkerWithIcon icon="hotspot" highlight={marker.id === selectedMarkerId} />
          </Marker>
        ))}
        {customMarkers?.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.lat}
            longitude={marker.lng}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(marker);
            }}
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
        {halo && (
          <Marker latitude={halo.lat} longitude={halo.lng}>
            <div className="w-9 h-9 rounded-full border-2 border-white/80 bg-white/70 flex items-center justify-center">
              <div
                className="rounded-full border-[#555] border-[0.75px] cursor-pointer"
                style={{
                  backgroundColor: halo.color,
                  width: isMobile ? "17px" : "15px",
                  height: isMobile ? "17px" : "15px",
                }}
              />
            </div>
          </Marker>
        )}
      </Map>
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
      <div className="absolute bottom-0 left-16 right-16 h-4 sm:hidden">
        {/* Prevents map from panning when close PWA on iOS with no home button */}
      </div>
    </div>
  );
}
