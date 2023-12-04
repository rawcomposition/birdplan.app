import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import CustomMarkerRow from "components/CustomMarkerRow";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import { useUI } from "providers/ui";
import CloseButton from "components/CloseButton";
import TargetSpeciesSidebarBlock from "components/TargetSpeciesSidebarBlock";
import RecentSpeciesSidebarBlock from "components/RecentSpeciesSidebarBlock";
import SettingsSidebarBlock from "components/SettingsSidebarBlock";
import TripLinks from "components/TripLinks";
import MapFlatIcon from "icons/MapFlat";
import ListIcon from "icons/List";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import ItineraryBuilder from "components/ItineraryBuilder";
import ErrorBoundary from "components/ErrorBoundary";

export default function Trip() {
  const { open } = useModal();
  const [view, setView] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState(false);
  const { trip, canEdit, selectedSpecies, setSelectedSpecies } = useTrip();
  const { closeSidebar, openSidebar, sidebarOpen } = useUI();
  const { user } = useUser();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);

  const savedHotspots = trip?.hotspots || [];
  const { hotspots, hotspotLayer } = useFetchHotspots(showAll);

  const { recentSpecies } = useFetchRecentSpecies(trip?.region);
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = selectedSpecies ? [] : [...savedHotspotMarkers];
  const customMarkers = selectedSpecies ? [] : trip?.markers || [];

  const hotspotClick = (id: string) => {
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);

    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot, speciesCode: selectedSpecies });
  };

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    observation.isPersonal
      ? open(observation.isPersonal ? "personalLocation" : "hotspot", {
          hotspot: observation,
          speciesCode: selectedSpecies?.code,
          speciesName: selectedSpecies?.name,
        })
      : open("hotspot", { hotspot: observation, speciesName: selectedSpecies?.name });
  };

  const handleEnableAddingMarker = () => {
    setIsAddingMarker(true);
    setSelectedSpecies(undefined);
    closeSidebar();
  };

  const tripIsLoaded = !!trip;
  const tripIsNew = trip?.hotspots.length === 0;

  React.useEffect(() => {
    if (tripIsLoaded && tripIsNew) {
      setShowAll(true);
    }
  }, [tripIsLoaded, tripIsNew]);

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <TripNav active={view} onChange={setView} />
      <main className="flex h-[calc(100%-60px-52px)]">
        <ErrorBoundary>
          {view !== "itinerary" && (
            <Sidebar noPadding fullWidth noAnimation noAccount extraMenuHeight={52}>
              {view === "" && (
                <div className="mb-4 px-6 pt-4 border-t border-gray-700">
                  <label className="text-white text-sm flex items-center gap-1">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={showAll}
                      onChange={() => setShowAll((prev) => !prev)}
                    />
                    Show all hotspots
                  </label>
                </div>
              )}
              <div>
                {view === "" && (
                  <Expand heading="Trip Hotspots" count={savedHotspots.length}>
                    <HotspotList />
                  </Expand>
                )}

                {view === "" && (
                  <Expand heading="Custom Markers" count={trip?.markers?.length}>
                    <ul className="space-y-2 mb-4 text-gray-200">
                      {trip?.markers?.map((marker) => (
                        <CustomMarkerRow key={marker.id} {...marker} />
                      ))}
                    </ul>
                    {canEdit && (
                      <>
                        {isAddingMarker ? (
                          <Button size="xs" color="gray" onClick={() => setIsAddingMarker(false)}>
                            Cancel Adding Marker
                          </Button>
                        ) : (
                          <Button size="xs" color="primary" onClick={handleEnableAddingMarker}>
                            + Add Marker
                          </Button>
                        )}
                      </>
                    )}
                  </Expand>
                )}
                {view === "targets" && <TargetSpeciesSidebarBlock />}
                {view === "targets" && canEdit && <RecentSpeciesSidebarBlock recentSpecies={recentSpecies} />}
                {view === "" && canEdit && <SettingsSidebarBlock />}
              </div>
              <TripLinks />
              {sidebarOpen && (
                <Button
                  color="pillWhite"
                  className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
                  onClick={closeSidebar}
                >
                  Map <MapFlatIcon className="w-4 h-4" />
                </Button>
              )}
            </Sidebar>
          )}

          <div className="h-full grow flex sm:relative flex-col w-full" onClick={closeSidebar}>
            {view === "itinerary" ? (
              <ItineraryBuilder />
            ) : (
              <>
                {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
                <div className="w-full grow relative">
                  {trip?.bounds && (
                    <MapBox
                      key={trip.id}
                      onHotspotClick={selectedSpecies ? obsClick : hotspotClick}
                      markers={markers}
                      customMarkers={customMarkers}
                      hotspotLayer={showAll && !selectedSpecies && hotspotLayer}
                      obsLayer={selectedSpecies && obsLayer}
                      bounds={trip.bounds}
                      addingMarker={isAddingMarker}
                      onDisableAddingMarker={() => setIsAddingMarker(false)}
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
            )}
          </div>
          {view !== "itinerary" && (
            <Button
              color="pillWhite"
              className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2"
              onClick={openSidebar}
            >
              List <ListIcon className="w-4 h-4" />
            </Button>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
