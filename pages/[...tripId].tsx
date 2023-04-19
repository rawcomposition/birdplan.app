import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import { GetServerSideProps } from "next";
import SpeciesRow from "components/SpeciesRow";
import CustomMarkerRow from "components/CustomMarkerRow";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import EbirdLinks from "components/EbirdLinks";
import { useUI } from "providers/ui";
import CloseButton from "components/CloseButton";
import useTripLifelist from "hooks/useTripLifelist";

type Props = {
  isNew: boolean;
  isShared: boolean;
  tripId: string;
};

export default function Trip({ isNew, isShared, tripId }: Props) {
  const { open } = useModal();
  const { user } = useUser();
  const [showAll, setShowAll] = React.useState(isNew);
  const { trip, selectedSpeciesCode, setSelectedSpeciesCode } = useTrip();
  const { lifelist } = useTripLifelist({ isShared, tripUid: trip?.userId });
  const { closeSidebar } = useUI();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const canEdit = user?.uid && trip?.userId === user.uid;

  const savedHotspots = trip?.hotspots || [];
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, hotspotLayer, call } = useFetchHotspots({
    region: trip?.region,
    fetchImmediately: isNew,
    savedIdStr,
  });

  const targetSpecies = trip?.targets.filter((it) => !lifelist.includes(it.code)) || [];
  const { recentSpecies } = useFetchRecentSpecies(lifelist, trip?.region);
  const selectedSpecies = [...recentSpecies, ...targetSpecies].find((it) => it.code === selectedSpeciesCode);
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpeciesCode });

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = selectedSpeciesCode ? [] : [...savedHotspotMarkers];
  const customMarkers = selectedSpeciesCode ? [] : trip?.markers || [];

  const hotspotClick = (id: string) => {
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);
    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot, speciesCode: selectedSpeciesCode });
  };

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    observation.isPersonal
      ? open(observation.isPersonal ? "personalLocation" : "hotspot", {
          hotspot: observation,
          speciesCode: selectedSpeciesCode,
          speciesName: selectedSpecies?.name,
        })
      : open("hotspot", { hotspot: observation, speciesCode: selectedSpeciesCode });
  };

  const handleToggleShowAll = () => {
    if (!showAll) call();
    setShowAll(!showAll);
  };

  const handleEnableAddingMarker = () => {
    setIsAddingMarker(true);
    setSelectedSpeciesCode(undefined);
  };

  return (
    <div className="flex flex-col h-screen">
      {trip && (
        <Head>
          <title>{`${trip.name} | bird planner`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/" }} />
      <main className="flex">
        <Sidebar>
          <div className={clsx("mb-4", !!selectedSpeciesCode && "opacity-50 pointer-events-none")}>
            <label className="text-white text-sm flex items-center gap-1">
              <input type="checkbox" className="mr-2" checked={showAll} onChange={handleToggleShowAll} />
              Show all hotspots
            </label>
          </div>
          <div className="-mx-6">
            <Expand heading="Saved Hotspots" className="text-white" defaultOpen count={savedHotspots.length}>
              <HotspotList />
            </Expand>

            <Expand heading="Custom Markers" className="text-white" count={trip?.markers?.length}>
              <ul className="space-y-2 mb-4">
                {trip?.markers?.map((marker) => (
                  <CustomMarkerRow key={marker.id} {...marker} />
                ))}
              </ul>
              {canEdit && (
                <>
                  {isAddingMarker ? (
                    <Button size="sm" color="gray" onClick={() => setIsAddingMarker(false)}>
                      Cancel Adding Marker
                    </Button>
                  ) : (
                    <Button size="sm" color="primary" onClick={handleEnableAddingMarker}>
                      + Add Marker
                    </Button>
                  )}
                </>
              )}
            </Expand>
            <Expand heading="Target Species" className="text-white" count={targetSpecies.length}>
              <ul className="divide-y divide-gray-800 mb-2">
                {targetSpecies.map((target) => (
                  <SpeciesRow key={target.code} {...target} />
                ))}
              </ul>
              {canEdit && (
                <Button size="sm" color="primary" onClick={() => open("uploadTargets")}>
                  Import Targets
                </Button>
              )}
            </Expand>
            <Expand heading="Recent Needs" className="text-white" count={recentSpecies.length}>
              <ul className="divide-y divide-gray-800">
                {recentSpecies.map(({ code, name }) => (
                  <SpeciesRow key={code} name={name} code={code} />
                ))}
              </ul>
            </Expand>
            {canEdit && (
              <Expand heading="My Life List" count={lifelist?.length} className="text-white">
                <Button size="sm" color="primary" onClick={() => open("uploadLifelist")}>
                  Import Life List
                </Button>
              </Expand>
            )}
          </div>
          {trip && <EbirdLinks trip={trip} />}
        </Sidebar>

        <div className="h-[calc(100vh_-_60px)] grow" onClick={closeSidebar}>
          <div className="w-full h-full relative">
            {trip?.bounds && (
              <MapBox
                key={trip.id}
                onHotspotClick={selectedSpeciesCode ? obsClick : hotspotClick}
                markers={markers}
                customMarkers={customMarkers}
                hotspotLayer={showAll && !selectedSpeciesCode && hotspotLayer}
                obsLayer={selectedSpeciesCode && obsLayer}
                bounds={trip.bounds}
                addingMarker={isAddingMarker}
                onDisableAddingMarker={() => setIsAddingMarker(false)}
              />
            )}
            {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
            {canEdit && isAddingMarker && (
              <div className="flex absolute top-0 left-1/2 bg-white text-gray-600 text-sm px-4 py-2 -translate-x-1/2 rounded-b-lg w-full max-w-xs z-10 text-center">
                Click anywhere on map to add marker
                <CloseButton onClick={() => setIsAddingMarker(false)} className="ml-auto" />
              </div>
            )}
          </div>
        </div>
      </main>
      {!isShared && <LoginModal />}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const isNew = query.new === "true";
  const isShared = query.shared === "true";
  const tripId = query.tripId;
  return { props: { isNew, tripId, isShared } };
};
