import React from "react";
import Sidebar from "components/sidebar";
import Header from "components/Header";
import Head from "next/head";
import useProfile from "hooks/useProfile";
import MapBox from "components/Mapbox";
import { EbirdHotspot } from "lib/types";
import { useModal } from "providers/modals";
import Expand from "components/Expand";

export default function Planner() {
  const { lifelist, radius, address, setRadius } = useProfile();
  const { open } = useModal();

  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showSeen, setShowSeen] = React.useState(false);
  const [selected, setSelected] = React.useState<EbirdHotspot>();

  const handleSelect = (hotspot: EbirdHotspot) => {
    setSelected(hotspot);
    open("hotspot", { hotspot });
  };

  const lat = 20.652816318357367;
  const lng = -87.67056139518648;

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>Find rare birds near you</title>
      </Head>

      <Header title="bird planner" />
      <main className="flex">
        <Sidebar open={showSidebar}>
          <div className="mb-4">
            <label className="text-white text-sm flex items-center gap-1">
              <input type="checkbox" className="mr-2" checked={!showSeen} onChange={() => setShowSeen(!showSeen)} />
              Show all hotspots
            </label>
          </div>
          <div className="-mx-6">
            <Expand heading="Saved Hotspots" className="text-white">
              Hola!
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
            <MapBox lat={lat} lng={lng} onSelect={handleSelect} />
          </div>
        </div>
      </main>
    </div>
  );
}
