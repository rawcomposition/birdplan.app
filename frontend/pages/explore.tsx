import React from "react";
import { Trip } from "@birdplan/shared";
import Header from "components/Header";
import MapBox from "components/Mapbox";
import MapButton from "components/MapButton";
import Icon from "components/Icon";
import { Card } from "components/ui/card";
import ErrorBoundary from "components/ErrorBoundary";
import { useModal } from "stores/modals";
import { useTrip } from "hooks/useTrip";
import useSavedHotspots from "hooks/useSavedHotspots";
import useHotspotLists from "hooks/useHotspotLists";
import useExploreHotspots from "hooks/useExploreHotspots";
import ExploreToolbar, { ALL_LISTS } from "components/ExploreToolbar";
import { useSearchParams } from "react-router-dom";
import { buildHotspotsLayer, getMarkerColorIndex } from "lib/helpers";

type Bounds = Trip["bounds"];

const VIEWPORT_KEY = "explore-viewport";
const WORLD_BOUNDS: Bounds = { minX: -170, minY: -55, maxX: 170, maxY: 72 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const clampBounds = (bounds: Bounds): Bounds => ({
  minX: clamp(bounds.minX, -180, 180),
  maxX: clamp(bounds.maxX, -180, 180),
  minY: clamp(bounds.minY, -85, 85),
  maxY: clamp(bounds.maxY, -85, 85),
});

const readStoredBounds = (): Bounds => {
  try {
    const raw = localStorage.getItem(VIEWPORT_KEY);
    const parsed = raw ? (JSON.parse(raw) as Bounds) : null;
    if (parsed && [parsed.minX, parsed.minY, parsed.maxX, parsed.maxY].every(Number.isFinite)) {
      const bounds = clampBounds(parsed);
      if (bounds.minX < bounds.maxX && bounds.minY < bounds.maxY) return bounds;
    }
  } catch {}
  return WORLD_BOUNDS;
};

const storeBounds = (bounds: Bounds) => {
  try {
    localStorage.setItem(VIEWPORT_KEY, JSON.stringify(bounds));
  } catch {}
};

export default function Explore() {
  const { open } = useModal();
  const { showSatellite, setShowSatellite } = useTrip();
  const [initialBounds] = React.useState(readStoredBounds);
  const [viewport, setViewport] = React.useState<{
    bounds: Bounds;
    zoom: number;
  } | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { lists } = useHotspotLists();
  const listParam = searchParams.get("list");
  const listId = listParam && lists.some((it) => it._id === listParam) ? listParam : ALL_LISTS;
  const setListId = (next: string) => setSearchParams(next === ALL_LISTS ? {} : { list: next }, { replace: true });

  const { savedHotspots: allSavedHotspots } = useSavedHotspots();
  const savedHotspots =
    listId === ALL_LISTS ? allSavedHotspots : allSavedHotspots.filter((it) => it.listIds.includes(listId));
  const { hotspots, isZoomedOut, isError } = useExploreHotspots(viewport?.bounds ?? null, viewport?.zoom ?? 0);

  const hotspotLayer = React.useMemo(
    () =>
      buildHotspotsLayer(
        hotspots,
        savedHotspots.map((it) => ({
          id: it.hotspotId,
          name: it.name,
          lat: it.lat,
          lng: it.lng,
        })),
      ),
    [hotspots, savedHotspots],
  );

  const markers = savedHotspots.map((it) => ({
    id: it.hotspotId,
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
  }));

  const hotspotClick = (id: string) => {
    const saved = allSavedHotspots.find((it) => it.hotspotId === id);
    const hotspot = hotspots.find((it) => it.id === id);
    const lat = saved?.lat ?? hotspot?.lat;
    const lng = saved?.lng ?? hotspot?.lng;
    if (lat == null || lng == null) return;
    open("exploreHotspot", {
      hotspotId: id,
      lat,
      lng,
      species: saved?.species ?? hotspot?.species,
    });
  };

  const handleMoveEnd = (rawBounds: Bounds, zoom: number) => {
    const bounds = clampBounds(rawBounds);
    setViewport({ bounds, zoom });
    storeBounds(bounds);
  };

  const notice = isZoomedOut
    ? "Zoom in to load hotspots"
    : isError
      ? "Too many hotspots in view. Zoom in to see them."
      : null;

  return (
    <div className="flex flex-col h-full">
      <title>Explore Hotspots | BirdPlan.app</title>
      <Header />
      <main className="flex flex-1 min-h-0 relative bg-background">
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            <div className="w-full grow relative">
              <ExploreToolbar listId={listId} onListChange={setListId} />
              <div className="absolute top-[68px] left-4 flex flex-col gap-3 z-10">
                <MapButton
                  onClick={() => setShowSatellite((prev) => !prev)}
                  tooltip="Satellite view"
                  active={showSatellite}
                >
                  <Icon name="layers" />
                </MapButton>
              </div>
              {notice && (
                <Card className="absolute top-16 left-1/2 z-10 -translate-x-1/2 px-4 py-2 text-sm text-muted-foreground shadow-md whitespace-nowrap">
                  {notice}
                </Card>
              )}
              <MapBox
                bounds={initialBounds}
                markers={markers}
                hotspotLayer={hotspotLayer}
                onHotspotClick={hotspotClick}
                onMoveEnd={handleMoveEnd}
                showSatellite={showSatellite}
              />
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
