import React from "react";
import { Marker, Source, Layer, useMap } from "react-map-gl";
import toast from "react-hot-toast";
import { Button } from "components/ui/button";
import { Spinner } from "components/ui/spinner";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import { TripCustomArea } from "@birdplan/shared";
import { cn } from "lib/utils";

const H3_RESOLUTION = 6;
const MAX_CELLS = 3000;

type LngLat = [number, number];

async function cellsForPolygon(polygon: LngLat[]): Promise<string[]> {
  const { polygonToCells } = await import("h3-js");
  return polygonToCells(
    polygon.map(([lng, lat]) => [lat, lng]),
    H3_RESOLUTION
  );
}

async function cellsToGeojson(cells: string[]) {
  const { cellsToMultiPolygon } = await import("h3-js");
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "MultiPolygon" as const, coordinates: cellsToMultiPolygon(cells, true) },
  };
}

export function CustomAreaLayer({ area }: { area: TripCustomArea }) {
  const [hexGeojson, setHexGeojson] = React.useState<any>(null);
  const cellsKey = area.cells.join(",");

  React.useEffect(() => {
    let cancelled = false;
    cellsToGeojson(area.cells).then((geojson) => {
      if (!cancelled) setHexGeojson(geojson);
    });
    return () => {
      cancelled = true;
    };
  }, [cellsKey]);

  if (!hexGeojson) return null;

  return (
    <Source id="custom-area" type="geojson" data={hexGeojson}>
      <Layer id="custom-area-fill" type="fill" paint={{ "fill-color": "#2563eb", "fill-opacity": 0.06 }} />
      <Layer id="custom-area-line" type="line" paint={{ "line-color": "#2563eb", "line-width": 1.5, "line-opacity": 0.5 }} />
    </Source>
  );
}

type Props = {
  onExit: () => void;
};

export default function AreaDraw({ onExit }: Props) {
  const { current: map } = useMap();
  const { trip } = useTrip();
  const [vertices, setVertices] = React.useState<LngLat[]>([]);
  const [closed, setClosed] = React.useState(false);
  const [cells, setCells] = React.useState<string[]>([]);
  const [hexGeojson, setHexGeojson] = React.useState<any>(null);
  const [isComputing, setIsComputing] = React.useState(false);

  const saveMutation = useTripMutation<{ customArea: TripCustomArea }>({
    url: `/trips/${trip?._id}/custom-area`,
    method: "PATCH",
    updateCache: (old, input) => ({ ...old, customArea: input.customArea }),
  });

  React.useEffect(() => {
    if (!map) return;
    const handleClick = (e: any) => {
      if (closed) return;
      setVertices((prev) => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
    };
    map.on("click", handleClick);
    map.getMap().doubleClickZoom.disable();
    return () => {
      map.off("click", handleClick);
      map.getMap().doubleClickZoom.enable();
    };
  }, [map, closed]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit]);

  const verticesKey = vertices.map((v) => v.join(":")).join(",");
  React.useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (vertices.length < 3) {
        setCells([]);
        setHexGeojson(null);
        setIsComputing(false);
        return;
      }
      setIsComputing(true);
      const nextCells = await cellsForPolygon(vertices);
      if (cancelled) return;
      setCells(nextCells);
      setHexGeojson(nextCells.length && nextCells.length <= MAX_CELLS ? await cellsToGeojson(nextCells) : null);
      setIsComputing(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [verticesKey]);

  const closeRing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vertices.length >= 3) setClosed(true);
  };

  const useMapView = () => {
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    setVertices([
      [b.getWest(), b.getSouth()],
      [b.getEast(), b.getSouth()],
      [b.getEast(), b.getNorth()],
      [b.getWest(), b.getNorth()],
    ]);
    setClosed(true);
  };

  const handleSave = () => {
    if (!cells.length) return toast.error("This area has no bird data — try a different spot");
    if (cells.length > MAX_CELLS) return toast.error("Area too large — use an eBird region for areas this big");
    saveMutation.mutate(
      { customArea: { polygon: vertices, cells } },
      {
        onSuccess: () => {
          toast.success("Custom targets area saved");
          onExit();
        },
      }
    );
  };

  const tooBig = cells.length > MAX_CELLS;
  const lineGeojson = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: closed && vertices.length >= 3 ? [...vertices, vertices[0]] : vertices,
    },
  };

  return (
    <>
      {hexGeojson && (
        <Source id="draw-hex-preview" type="geojson" data={hexGeojson}>
          <Layer id="draw-hex-fill" type="fill" paint={{ "fill-color": "#2563eb", "fill-opacity": 0.12 }} />
          <Layer id="draw-hex-line" type="line" paint={{ "line-color": "#2563eb", "line-width": 1, "line-opacity": 0.4 }} />
        </Source>
      )}
      {vertices.length > 0 && (
        <Source id="draw-line" type="geojson" data={lineGeojson}>
          <Layer id="draw-line-layer" type="line" paint={{ "line-color": "#1d4ed8", "line-width": 2, "line-dasharray": [2, 1.5] }} />
        </Source>
      )}
      {vertices.map(([lng, lat], index) => (
        <Marker key={`${lng}:${lat}:${index}`} longitude={lng} latitude={lat}>
          <button
            type="button"
            aria-label={index === 0 && !closed ? "Finish area" : `Point ${index + 1}`}
            onClick={index === 0 && !closed ? closeRing : (e) => e.stopPropagation()}
            className={cn(
              "block rounded-full border-2 border-white shadow-md",
              index === 0 && !closed && vertices.length >= 3
                ? "h-5 w-5 cursor-pointer bg-primary animate-pulse"
                : "h-3 w-3 bg-primary-hover"
            )}
          />
        </Marker>
      ))}
      <div className="absolute top-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2">
        <div className="rounded-xl border bg-card p-3 shadow-lg">
          <p className="text-sm text-secondary-foreground">
            {closed
              ? tooBig
                ? "This area is too large — draw something smaller or use an eBird region."
                : "Ready to go. Targets will come from the highlighted cells."
              : vertices.length < 3
                ? "Click the map to outline your birding area. Drag to pan as usual."
                : "Keep clicking to refine, or click the first point to finish."}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!closed && (
              <Button size="xs" variant="secondary" onClick={useMapView}>
                Use current map view
              </Button>
            )}
            {closed && (
              <Button
                size="xs"
                onClick={handleSave}
                disabled={isComputing || tooBig || !cells.length}
                loading={saveMutation.isPending}
                loadingText="Saving..."
              >
                Save area
              </Button>
            )}
            {isComputing ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Spinner className="size-3.5" /> Calculating cells...
              </span>
            ) : (
              !!cells.length && (
                <span className={cn("text-xs", tooBig ? "text-destructive" : "text-muted-foreground")}>
                  {cells.length.toLocaleString()} cells{tooBig && ` (max ${MAX_CELLS.toLocaleString()})`}
                </span>
              )
            )}
            <Button size="xs" variant="ghost" className="ml-auto" onClick={onExit}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
