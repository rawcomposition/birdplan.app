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
import HotspotList from "components/HotspotList";

export default function Trip() {
  const { open } = useModal();
  const [showAll, setShowAll] = React.useState(false);
  const [showSatellite, setShowSatellite] = React.useState(false);
  const { trip, canEdit, is404, setSelectedSpecies, isHotspotListOpen, setIsHotspotListOpen } = useTrip();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);

  const savedHotspots = trip?.hotspots || [];
  const { hotspots, hotspotLayer } = useFetchHotspots(showAll);

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
      setShowAll(true);
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
      <TripNav active="" />
      <main className="flex h-[calc(100%-60px-52px)] relative">
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          <MapButton
            onClick={() => setShowAll((prev) => !prev)}
            tooltip={showAll ? "Hide hotspots" : "Show hotspots"}
            active={showAll}
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
          <MapButton
            onClick={() => setIsHotspotListOpen(!isHotspotListOpen)}
            tooltip={isHotspotListOpen ? "Hide List" : "View List"}
            active={isHotspotListOpen}
          >
            <Icon name="list" />
          </MapButton>
        </div>
        <ErrorBoundary>
          <HotspotList isOpen={isHotspotListOpen} onClose={() => setIsHotspotListOpen(false)} />
          <div className="h-full grow flex sm:relative flex-col w-full">
            <>
              <div className="w-full grow relative">
                {trip?.bounds && (
                  <MapBox
                    key={trip.id}
                    onHotspotClick={hotspotClick}
                    markers={markers}
                    customMarkers={customMarkers}
                    hotspotLayer={showAll && hotspotLayer}
                    bounds={trip.bounds}
                    addingMarker={isAddingMarker}
                    onDisableAddingMarker={() => setIsAddingMarker(false)}
                    showSatellite={showSatellite}
                  />
                )}
                {isAddingMarker && (
                  <div className="flex absolute top-0 left-1/2 bg-white text-gray-600 text-sm px-4 py-2 -translate-x-1/2 rounded-b-lg w-full max-w-xs z-10 text-center">
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
                    <CloseButton onClick={() => setIsAddingMarker(false)} className="ml-auto" />
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
