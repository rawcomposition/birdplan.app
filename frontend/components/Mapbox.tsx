import React from "react";
import Map, { Source, Layer, GeolocateControl } from "react-map-gl";
import type { MapboxMap } from "react-map-gl";
import { Marker as MarkerT } from "lib/types";
import { Trip, CustomMarker } from "@birdplan/shared";
import { markerIcons } from "lib/icons";
import { markerColors, getLatLngFromBounds } from "lib/helpers";
import clsx from "clsx";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import { HotspotFilters, DEFAULT_HOTSPOT_FILTERS } from "stores/hotspotFilterPreferences";

type Props = {
  bounds: Trip["bounds"];
  markers?: MarkerT[];
  customMarkers?: CustomMarker[];
  hotspotLayer?: any;
  hotspotFilters?: HotspotFilters;
  obsLayer?: any;
  addingMarker?: boolean;
  showSatellite?: boolean;
  onHotspotClick?: (id: string) => void;
  onDisableAddingMarker?: () => void;
  onMoveEnd?: (bounds: Trip["bounds"], zoom: number) => void;
};

const markerImageIds = [
  ...markerColors.map((_, i) => `saved-hotspot-${i}`),
  "deleted-hotspot",
  ...Object.keys(markerIcons).map((it) => `place-${it}`),
];

const loadMarkerImages = (map: MapboxMap) => {
  markerImageIds.forEach((id) => {
    if (map.hasImage(id)) return;
    map.loadImage(`/markers/${id}.png`, (error, image) => {
      if (error || !image || map.hasImage(id)) return;
      map.addImage(id, image, { pixelRatio: 2 });
      map.triggerRepaint();
    });
  });
};

const clickableLayerIds = ["markers", "hotspots", "obs"];

const markerImage = (marker: MarkerT) => (marker.deleted ? "deleted-hotspot" : `saved-hotspot-${marker.shade ?? 0}`);
const placeImage = (marker: CustomMarker) => `place-${marker.icon in markerIcons ? marker.icon : "hotspot"}`;

export default function Mapbox({
  bounds,
  markers,
  customMarkers,
  onHotspotClick,
  hotspotLayer,
  hotspotFilters = DEFAULT_HOTSPOT_FILTERS,
  obsLayer,
  addingMarker,
  showSatellite,
  onDisableAddingMarker,
  onMoveEnd,
}: Props) {
  const { open, closeAll } = useModal();
  const { selectedMarkerId } = useTrip();
  const isOpeningModal = React.useRef(false);

  const handleHotspotClick = (id: string) => {
    isOpeningModal.current = true;
    onHotspotClick?.(id);
    setTimeout(() => {
      isOpeningModal.current = false;
    }, 500);
  };

  const handleMarkerClick = (markerId: string) => {
    isOpeningModal.current = true;
    open("viewMarker", { markerId });
    setTimeout(() => {
      isOpeningModal.current = false;
    }, 500);
  };

  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const visibleHotspotCount = (hotspotLayer?.features || []).filter(
    (f: any) =>
      f.properties.checklists >= hotspotFilters.minChecklists &&
      f.properties.species >= hotspotFilters.minSpecies
  ).length;
  const isSparse = visibleHotspotCount < 50;

  const hsRadius = (scale = 1, offset = 0) => {
    const px = (v: number) => v * scale + offset;
    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      6,
      isSparse
        ? ["interpolate", ["linear"], ["get", "species"], 0, px(3.5), 300, px(7)]
        : ["interpolate", ["linear"], ["get", "species"], 0, px(3), 300, px(5)],
      9,
      ["interpolate", ["linear"], ["get", "species"], 0, px(4.5), 300, px(9)],
      12,
      ["interpolate", ["linear"], ["get", "species"], 0, px(7), 300, px(isMobile ? 10 : 9)],
    ];
  };
  const hsFilter = [
    "all",
    [">=", ["get", "checklists"], hotspotFilters.minChecklists],
    [">=", ["get", "species"], hotspotFilters.minSpecies],
  ];

  const hsLayerStyle = {
    id: "hotspots",
    type: "circle",
    filter: hsFilter,
    paint: {
      "circle-radius": hsRadius(),
      "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 6, 0.3, 12, 0.75],
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

  const selectedFilter = [...hsFilter, ["==", ["get", "id"], selectedMarkerId ?? ""]];
  const hsHaloLayerStyle = {
    id: "hotspot-halo",
    type: "circle",
    filter: selectedFilter,
    paint: {
      "circle-radius": hsRadius(1.6, 1),
      "circle-color": "rgba(255,255,255,0.7)",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };

  const hsSelectedLayerStyle = { ...hsLayerStyle, id: "hotspot-selected", filter: selectedFilter };

  const markerLayer: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [
      ...(markers || []).map((it) => ({ ...it, type: "hotspot", image: markerImage(it) })),
      ...(customMarkers || []).map((it) => ({ ...it, type: "place", image: placeImage(it) })),
    ].map(({ lat, lng, id, type, image }) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [lng, lat] },
      properties: { id, type, image },
    })),
  };
  const markerSelectedFilter = ["==", ["get", "id"], selectedMarkerId ?? ""];
  const markerLayerStyle = {
    id: "markers",
    type: "symbol",
    layout: {
      "icon-image": ["get", "image"],
      "icon-size": ["interpolate", ["linear"], ["zoom"], 7, 0.7, 12, 0.9],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  };
  const markerHaloLayerStyle = {
    id: "marker-halo",
    type: "circle",
    filter: markerSelectedFilter,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 16, 12, 20],
      "circle-color": "rgba(255,255,255,0.7)",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    },
  };
  const markerSelectedLayerStyle = { ...markerLayerStyle, id: "marker-selected", filter: markerSelectedFilter };

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
  const obsHaloLayerStyle = {
    id: "obs-halo",
    type: "circle",
    filter: markerSelectedFilter,
    paint: { ...markerHaloLayerStyle.paint, "circle-radius": isMobile ? 14 : 12 },
  };
  const obsSelectedLayerStyle = { ...obsLayerStyle, id: "obs-selected", filter: markerSelectedFilter };

  const activeLayers = ["markers", hotspotLayer && "hotspots", obsLayer && "obs"].filter(Boolean);
  const { lat, lng } = getLatLngFromBounds(bounds);
  if (lat == null || lng == null) return null;

  return (
    <div className={clsx("relative w-full h-full", addingMarker && "mapboxAddMarkerMode")}>
      <Map
        initialViewState={{
          longitude: lng,
          latitude: lat,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={
          showSatellite ? "mapbox://styles/mapbox/satellite-streets-v11" : "mapbox://styles/mapbox/outdoors-v11"
        }
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_KEY}
        interactiveLayerIds={activeLayers}
        onLoad={(e) => {
          loadMarkerImages(e.target);
          e.target.on("style.load", () => loadMarkerImages(e.target));
          e.target.on("mousemove", (ev) => {
            const map = ev.target;
            if (map.isMoving()) return;
            const layers = clickableLayerIds.filter((id) => map.getLayer(id));
            const hovering = layers.length > 0 && map.queryRenderedFeatures(ev.point, { layers }).length > 0;
            map.getCanvas().style.cursor = hovering ? "pointer" : "";
          });
          const b = e.target.getBounds();
          onMoveEnd?.({ minX: b.getWest(), minY: b.getSouth(), maxX: b.getEast(), maxY: b.getNorth() }, e.target.getZoom());
        }}
        onMoveEnd={(e) => {
          const b = e.target.getBounds();
          onMoveEnd?.({ minX: b.getWest(), minY: b.getSouth(), maxX: b.getEast(), maxY: b.getNorth() }, e.viewState.zoom);
        }}
        onClick={(e) => {
          if (addingMarker) {
            const lat = Math.round(e.lngLat.lat * 1000000) / 1000000;
            const lng = Math.round(e.lngLat.lng * 1000000) / 1000000;
            open("addMarker", { lat, lng });
            onDisableAddingMarker?.();
            return;
          }
          const feature = e.target.queryRenderedFeatures(e.point, { layers: activeLayers })[0];
          if (feature?.properties?.type === "place") {
            handleMarkerClick(feature.properties.id);
          } else if (feature) {
            handleHotspotClick(feature.properties?.id);
          } else if (!isOpeningModal.current) {
            closeAll();
          }
        }}
        // @ts-expect-error react-map-gl bounds prop typing mismatch
        bounds={[
          [bounds.minX, bounds.minY],
          [bounds.maxX, bounds.maxY],
        ]}
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
        {hotspotLayer && (
          <Source id="hotspot-layer" type="geojson" data={hotspotLayer}>
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...hsLayerStyle} />
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...hsHaloLayerStyle} />
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...hsSelectedLayerStyle} />
          </Source>
        )}
        <Source id="marker-layer" type="geojson" data={markerLayer}>
          {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
          <Layer {...markerLayerStyle} />
          {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
          <Layer {...markerHaloLayerStyle} />
          {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
          <Layer {...markerSelectedLayerStyle} />
        </Source>
        {obsLayer && (
          <Source id="obs-layer" type="geojson" data={obsLayer}>
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...obsLayerStyle} />
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...obsHaloLayerStyle} />
            {/* @ts-expect-error react-map-gl Layer style spread typing mismatch */}
            <Layer {...obsSelectedLayerStyle} />
          </Source>
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
