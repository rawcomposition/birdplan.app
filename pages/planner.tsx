import React from "react";
import Sidebar from "components/sidebar";
import Header from "components/Header";
import Head from "next/head";
import { useProfile } from "providers/profile";
import MapBox from "components/Mapbox";
import { Marker, Bounds } from "lib/types";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import { getMarkerColorIndex } from "lib/helpers";
import HotspotList from "components/HotspotList";
import { GetServerSideProps } from "next";

//TODO
const initialLat = 20.652816318357367;
const initialLng = -87.67056139518648;
const title = "Playa del Carmen";
const region = "MX-ROO";

export default function Planner({ isNew }: any) {
  const { open } = useModal();
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showAll, setShowAll] = React.useState(isNew);

  const { hotspots: savedHotspots } = useProfile();
  const savedIdStr = savedHotspots.map((it) => it.id).join(",");
  const { hotspots, layer, call } = useFetchHotspots({ region, fetchImmediately: isNew, savedIdStr });

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
            <Expand heading="Recent Species" className="text-white">
              Hola!
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
              layer={layer}
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
