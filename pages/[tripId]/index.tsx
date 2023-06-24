import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import Head from "next/head";
import { useProfile } from "providers/profile";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import SpeciesRow from "components/SpeciesRow";
import CustomMarkerRow from "components/CustomMarkerRow";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import ExternalIcon from "icons/External";
import ShareIcon from "icons/Share";
import Link from "next/link";
import { useUI } from "providers/ui";
import CloseButton from "components/CloseButton";
import TargetSpeciesSidebarBlock from "components/TargetSpeciesSidebarBlock";

export default function Trip() {
  const { open } = useModal();
  const [showAll, setShowAll] = React.useState(false);
  const { lifelist } = useProfile();
  const { targets, trip, isOwner, canEdit, selectedSpeciesCode, setSelectedSpeciesCode, reset } = useTrip();
  const { closeSidebar } = useUI();
  const [isAddingMarker, setIsAddingMarker] = React.useState(false);
  const isMultiRegion = trip?.region.includes(",");

  const savedHotspots = trip?.hotspots || [];
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, hotspotLayer, call } = useFetchHotspots({
    region: trip?.region,
    savedIdStr,
  });

  const { recentSpecies } = useFetchRecentSpecies(trip?.region);
  const selectedSpecies = [...recentSpecies, ...targets].find((it) => it.code === selectedSpeciesCode);
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
      : open("hotspot", { hotspot: observation, speciesName: selectedSpecies?.name });
  };

  const handleToggleShowAll = () => {
    if (!showAll) call();
    setShowAll(!showAll);
  };

  const handleEnableAddingMarker = () => {
    setIsAddingMarker(true);
    setSelectedSpeciesCode(undefined);
  };

  const tripIsLoaded = !!trip;
  const tripIsNew = trip?.hotspots.length === 0;

  React.useEffect(() => {
    if (tripIsLoaded && tripIsNew) {
      setShowAll(true);
      call();
    }
  }, [tripIsLoaded, tripIsNew, call]);

  React.useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | Bird Planner`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="flex h-[calc(100%-60px)]">
        <Sidebar noPadding>
          <div className={clsx("mb-4 mt-6 mx-6", !!selectedSpeciesCode && "opacity-50 pointer-events-none")}>
            <label className="text-white text-sm flex items-center gap-1">
              <input type="checkbox" className="mr-2" checked={showAll} onChange={handleToggleShowAll} />
              Show all hotspots
            </label>
          </div>
          <div>
            <Expand heading="Saved Hotspots" className="text-white" defaultOpen count={savedHotspots.length}>
              <HotspotList />
            </Expand>

            <Expand heading="Custom Markers" className="text-white" count={trip?.markers?.length}>
              <ul className="space-y-2 mb-4 text-gray-200">
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
            <TargetSpeciesSidebarBlock />
            {canEdit && (
              <Expand heading="Recent Needs" className="text-white" count={recentSpecies.length}>
                <ul className="divide-y divide-gray-800">
                  {recentSpecies.map(({ code, name }) => (
                    <SpeciesRow key={code} name={name} code={code} />
                  ))}
                </ul>
              </Expand>
            )}
            {canEdit && (
              <Expand heading="My Life List" count={lifelist?.length} className="text-white">
                <Button size="sm" color="primary" href={`/import-lifelist/${trip?.id}`}>
                  Import Life List
                </Button>
              </Expand>
            )}
          </div>
          {isOwner && (
            <div className={clsx("mt-4 ml-4 text-sm lg:hidden", isMultiRegion && "mb-8")}>
              <button
                type="button"
                className="text-gray-400 inline-flex items-center gap-2"
                onClick={() => open("share")}
              >
                <ShareIcon className="" />
                Share
              </button>
            </div>
          )}
          {trip && !isMultiRegion && (
            <div
              className={clsx("mb-8 ml-4 text-sm text-gray-400 flex flex-col gap-2", isOwner ? "mt-2 lg:mt-4" : "mt-4")}
            >
              <Link
                href={`https://ebird.org/targets?region=&r1=${trip.region}&bmo=${trip.startMonth}&emo=${trip.endMonth}&r2=world&t2=life&mediaType=`}
                className="text-gray-400 inline-flex items-center gap-1"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> eBird Targets
              </Link>
              <Link
                href={`https://ebird.org/region/${trip.region}/media?yr=all&m=`}
                className="text-gray-400 inline-flex items-center gap-2"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> Illustrated Checklist
              </Link>
            </div>
          )}
        </Sidebar>

        <div className="h-full grow" onClick={closeSidebar}>
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
            {isAddingMarker && (
              <div className="flex absolute top-0 left-1/2 bg-white text-gray-600 text-sm px-4 py-2 -translate-x-1/2 rounded-b-lg w-full max-w-xs z-10 text-center">
                Click anywhere on map to add marker
                <CloseButton onClick={() => setIsAddingMarker(false)} className="ml-auto" />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
