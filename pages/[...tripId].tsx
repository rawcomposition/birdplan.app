import React from "react";
import Sidebar from "components/sidebar";
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
import LifelistUpload from "components/LifelistUpload";
import SpeciesRow from "components/SpeciesRow";
import Button from "components/Button";
import Bullseye from "icons/Bullseye";
import CloseButton from "components/CloseButton";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";

type Props = {
  isNew: boolean;
  tripId: string;
};

export default function Trip({ isNew, tripId }: Props) {
  const { open } = useModal();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showAll, setShowAll] = React.useState(isNew);
  const { lifelist } = useProfile();
  const { trip, selectedSpeciesCode, setSelectedSpeciesCode } = useTrip();

  const savedHotspots = trip?.hotspots || [];
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, hotspotLayer, call } = useFetchHotspots({
    region: trip?.region,
    fetchImmediately: isNew,
    savedIdStr,
  });
  const { recentSpecies } = useFetchRecentSpecies(trip?.region);
  const selectedSpecies = recentSpecies.find((it) => it.code === selectedSpeciesCode);
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
        <Sidebar open={showSidebar}>
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
            <Expand heading="Target Species" className="text-white">
              Hola!
            </Expand>
            <Expand heading="Recent Needs" className="text-white" count={recentSpecies.length}>
              <ul className="divide-y divide-gray-800">
                {recentSpecies.map(({ code, name }) => (
                  <SpeciesRow key={code} name={name} code={code} />
                ))}
              </ul>
            </Expand>
            <Expand heading="My Life List" count={lifelist?.length} className="text-white">
              <LifelistUpload />
            </Expand>
          </div>
        </Sidebar>

        <div className="h-[calc(100vh_-_60px)] grow" onClick={() => setShowSidebar(false)}>
          <div className="w-full h-full relative">
            {trip?.bounds && (
              <MapBox
                onHotspotClick={selectedSpeciesCode ? obsClick : hotspotClick}
                markers={markers}
                hotspotLayer={showAll && !selectedSpeciesCode && hotspotLayer}
                obsLayer={selectedSpeciesCode && obsLayer}
                bounds={trip.bounds}
              />
            )}
            {selectedSpecies && (
              <div className="absolute top-0 left-1/2 bg-white px-4 py-3 -translate-x-1/2 rounded-b-lg w-full max-w-md">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{selectedSpecies.name}</h2>
                  <Button color="gray" size="xs">
                    <Bullseye className="mr-1 -mt-[3px] text-[#c2410d]" /> Add Target
                  </Button>
                  <CloseButton onClick={() => setSelectedSpeciesCode(undefined)} className="ml-auto" />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Showing reports over the last 30 days.{" "}
                  <a
                    href={`https://ebird.org/map/${selectedSpeciesCode}?env.minX=${trip?.bounds?.minX}&env.minY=${trip?.bounds?.minY}&env.maxX=${trip?.bounds?.maxX}&env.maxY=${trip?.bounds?.maxY}`}
                    className="text-sky-700"
                    target="_blank"
                  >
                    View on eBird
                  </a>
                </p>
              </div>
            )}
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
