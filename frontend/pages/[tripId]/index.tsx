import React from "react";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import useFetchHotspots from "hooks/useFetchHotspots";
import { getMarkerColorIndex } from "lib/helpers";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import CloseButton from "components/CloseButton";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import ErrorBoundary from "components/ErrorBoundary";
import MapButton from "components/MapButton";
import Icon from "components/Icon";
import NotFound from "components/NotFound";

export default function Trip() {
  const { open } = useModal();
  const {
    trip,
    canEdit,
    is404,
    setSelectedSpecies,
    showAllHotspots,
    setShowAllHotspots,
    showSatellite,
    setShowSatellite,
  } = useTrip();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);

  const savedHotspots = trip?.hotspots || [];
  const { hotspots, hotspotLayer } = useFetchHotspots(showAllHotspots);

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = [...savedHotspotMarkers];
  const customMarkers = trip?.markers || [];

  const hotspotClick = (id: string) => {
    setSelectedSpecies(undefined);
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);
    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot });
  };

  const tripIsLoaded = !!trip;
  const tripIsNew = trip?.hotspots.length === 0;

  React.useEffect(() => {
    if (tripIsLoaded && tripIsNew) {
      setShowAllHotspots(true);
    }
  }, [tripIsLoaded, tripIsNew]);

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <TripNav active="" border={false} />
      <main className="flex h-[calc(100%-60px-55px)] relative">
        <div className="absolute top-4 right-4 sm:left-4 sm:right-auto flex flex-col gap-3 z-10">
          <MapButton
            onClick={() => setShowAllHotspots((prev) => !prev)}
            tooltip={showAllHotspots ? "Hide hotspots" : "Show hotspots"}
            active={showAllHotspots}
          >
            <Icon name="mapFlatPin" />
          </MapButton>
          <MapButton onClick={() => setShowSatellite((prev) => !prev)} tooltip="Satellite view" active={showSatellite}>
            <Icon name="layers" />
          </MapButton>
          {canEdit && (
            <MapButton
              onClick={() => setIsAddingMarker((prev) => !prev)}
              tooltip={isAddingMarker ? "Cancel add marker" : "Add location"}
              active={isAddingMarker}
              childItems={[
                {
                  label: "eBird Hotspot",
                  onClick: () => open("addHotspot"),
                  icon: <Icon name="star" />,
                },
                {
                  label: "Place",
                  onClick: () => open("addPlace"),
                  icon: <Icon name="utensils" />,
                },
                {
                  label: "Custom",
                  onClick: () => setIsAddingMarker((prev) => !prev),
                  icon: <Icon name="genericMarker" />,
                },
              ]}
            >
              <Icon name="markerPlus" />
            </MapButton>
          )}
        </div>
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            <>
              <div className="w-full grow relative">
                {trip?.bounds && (
                  <MapBox
                    key={trip._id}
                    onHotspotClick={hotspotClick}
                    markers={markers}
                    customMarkers={customMarkers}
                    hotspotLayer={showAllHotspots && hotspotLayer}
                    bounds={trip.bounds}
                    addingMarker={isAddingMarker}
                    onDisableAddingMarker={() => setIsAddingMarker(false)}
                    showSatellite={showSatellite}
                  />
                )}
                {isAddingMarker && (
                  <div className="flex absolute top-0 left-1/2 bg-white text-gray-600 text-sm px-4 py-2 -translate-x-1/2 rounded-b-lg w-full max-w-xs z-10 text-center justify-between">
                    <div>
                      Click anywhere on map to add marker
                      <br />
                      or{" "}
                      <button
                        className="underline"
                        onClick={() => {
                          setIsAddingMarker(false);
                          open("addMarker");
                        }}
                      >
                        enter coordinates
                      </button>
                    </div>
                    <CloseButton onClick={() => setIsAddingMarker(false)} />
                  </div>
                )}
                {showAllHotspots && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow">
                    Hotspot colors show all-time species counts.
                  </div>
                )}
              </div>
            </>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
