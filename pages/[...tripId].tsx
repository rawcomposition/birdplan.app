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
import { GetServerSideProps } from "next";
import SpeciesRow from "components/SpeciesRow";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import ExternalIcon from "icons/External";
import Link from "next/link";
import { useUI } from "providers/ui";

type Props = {
  isNew: boolean;
  tripId: string;
};

export default function Trip({ isNew, tripId }: Props) {
  const { open } = useModal();
  const [showAll, setShowAll] = React.useState(isNew);
  const { lifelist } = useProfile();
  const { trip, selectedSpeciesCode } = useTrip();
  const { closeSidebar } = useUI();

  const savedHotspots = trip?.hotspots || [];
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, hotspotLayer, call } = useFetchHotspots({
    region: trip?.region,
    fetchImmediately: isNew,
    savedIdStr,
  });

  const targetSpecies = trip?.targets.filter((it) => !lifelist.includes(it.code)) || [];
  const { recentSpecies } = useFetchRecentSpecies(trip?.region);
  const selectedSpecies = [...recentSpecies, ...targetSpecies].find((it) => it.code === selectedSpeciesCode);
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpeciesCode });

  const savedHotspotMarkers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    type: "hotspot",
    shade: getMarkerColorIndex(it.species || 0),
    id: it.id,
  }));

  const markers = selectedSpeciesCode ? [] : [...savedHotspotMarkers];

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
            <Expand heading="Target Species" className="text-white" count={targetSpecies.length}>
              <ul className="divide-y divide-gray-800 mb-2">
                {targetSpecies.map((target) => (
                  <SpeciesRow key={target.code} {...target} />
                ))}
              </ul>
              <Button size="sm" color="primary" onClick={() => open("uploadTargets")}>
                Import Targets
              </Button>
            </Expand>
            <Expand heading="Recent Needs" className="text-white" count={recentSpecies.length}>
              <ul className="divide-y divide-gray-800">
                {recentSpecies.map(({ code, name }) => (
                  <SpeciesRow key={code} name={name} code={code} />
                ))}
              </ul>
            </Expand>
            <Expand heading="My Life List" count={lifelist?.length} className="text-white">
              <Button size="sm" color="primary" onClick={() => open("uploadLifelist")}>
                Import Life List
              </Button>
            </Expand>
          </div>
          {trip && (
            <div className="mt-4 text-sm text-gray-400 flex flex-col gap-2">
              <Link
                href={`https://ebird.org/targets?region=&r1=${trip.region}&bmo=${trip.startMonth}&emo=${trip.endMonth}&r2=world&t2=life&mediaType=`}
                className="text-gray-400 inline-flex items-center gap-1"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> eBird Targets
              </Link>
              <Link
                href={`https://ebird.org/region/${trip.region}/media?yr=all&m=`}
                className="text-gray-400 inline-flex items-center gap-1"
                target="_blank"
              >
                <ExternalIcon className="text-xs" /> Illustrated Checklist
              </Link>
            </div>
          )}
        </Sidebar>

        <div className="h-[calc(100vh_-_60px)] grow" onClick={closeSidebar}>
          <div className="w-full h-full relative">
            {trip?.bounds && (
              <MapBox
                key={trip.id}
                onHotspotClick={selectedSpeciesCode ? obsClick : hotspotClick}
                markers={markers}
                hotspotLayer={showAll && !selectedSpeciesCode && hotspotLayer}
                obsLayer={selectedSpeciesCode && obsLayer}
                bounds={trip.bounds}
              />
            )}
            {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const isNew = query.new === "true";
  const tripId = query.tripId;
  return { props: { isNew, tripId } };
};
