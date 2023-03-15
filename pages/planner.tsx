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
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import { GetServerSideProps } from "next";
import LifelistUpload from "components/LifelistUpload";
import SpeciesRow from "components/SpeciesRow";

//TODO
const initialLat = 20.652816318357367;
const initialLng = -87.67056139518648;
const title = "Playa del Carmen";
const region = "MX-ROO";

export default function Planner({ isNew }: any) {
  const { open } = useModal();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showAll, setShowAll] = React.useState(isNew);
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>();

  const { hotspots: savedHotspots, lifelist } = useProfile();
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, hotspotLayer, call } = useFetchHotspots({ region, fetchImmediately: isNew, savedIdStr });
  const { recentSpecies } = useFetchRecentSpecies(region);

  const markers = savedHotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    type: "hotspot",
    shade: getMarkerColorIndex(it.species),
    id: it.id,
  }));

  const handleHotspotClick = (id: string) => {
    const allHotspots = hotspots.length > 0 ? hotspots : savedHotspots;
    const hotspot = allHotspots.find((it) => it.id === id);
    open("hotspot", { hotspot });
  };

  const handleToggleShowAll = () => {
    if (!showAll) call();
    setShowAll(!showAll);
  };

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>{`${title} | bird planner`}</title>
      </Head>

      <Header title={title} parent={{ title: "Trips", href: "/" }} />
      <main className="flex">
        <Sidebar open={showSidebar}>
          <div className="mb-4">
            <label className="text-white text-sm flex items-center gap-1">
              <input type="checkbox" className="mr-2" checked={showAll} onChange={handleToggleShowAll} />
              Show all hotspots
            </label>
          </div>
          <div className="-mx-6">
            <Expand heading="Saved Hotspots" className="text-white" defaultOpen>
              <HotspotList />
            </Expand>
            <Expand heading="Target Species" className="text-white">
              Hola!
            </Expand>
            <Expand heading="Recent Needs" className="text-white" count={recentSpecies.length}>
              <ul className="divide-y divide-gray-800">
                {recentSpecies.map(({ code, name }) => (
                  <SpeciesRow
                    key={code}
                    name={name}
                    selected={selectedSpecies === code}
                    onClick={() => setSelectedSpecies(code)}
                  />
                ))}
              </ul>
            </Expand>
            <Expand heading="My Life List" count={lifelist?.length} className="text-white">
              <LifelistUpload />
            </Expand>
          </div>
        </Sidebar>

        <div className="h-[calc(100vh_-_60px)] grow" onClick={() => setShowSidebar(false)}>
          <div className="w-full h-full">
            <MapBox
              lat={initialLat}
              lng={initialLng}
              onHotspotClick={handleHotspotClick}
              markers={markers}
              hotspotLayer={hotspotLayer}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const isNew = query.new === "true";
  return { props: { isNew } };
};
