import React from "react";
import Sidebar from "components/sidebar";
import Header from "components/Header";
import Head from "next/head";
import useProfile from "hooks/useProfile";
import MapBox from "components/Mapbox";
import { EbirdHotspot, Marker } from "lib/types";
import { useModal } from "providers/modals";
import Expand from "components/Expand";
import useFetchHotspots from "hooks/useFetchHotspots";
import { getMarkerShade } from "lib/helpers";

export default function Planner() {
  const { hotspots, call } = useFetchHotspots();
  const {} = useProfile();
  const { open } = useModal();

  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showSeen, setShowSeen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>();

  const hotspotMarkers = hotspots.map((it) => ({
    lat: it.lat,
    lng: it.lng,
    type: "hotspot",
    shade: getMarkerShade(it.numSpeciesAllTime),
    id: it.locId,
  }));

  const markers = [...hotspotMarkers];

  const handleSelect = ({ id, type }: Marker) => {
    setSelectedId(id);
    if (type === "hotspot") {
      const hotspot = hotspots.find((it) => it.locId === id);
      open("hotspot", { hotspot });
    }
  };

  //TODO
  const initialLat = 20.652816318357367;
  const initialLng = -87.67056139518648;
  const title = "Playa del Carmen";

  return (
    <div className="flex flex-col h-screen">
      <Head>
        <title>{title} | bird planner</title>
      </Head>

      <Header title={title} parent={{ title: "Trips", href: "/" }} />
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
            <MapBox
              lat={initialLat}
              lng={initialLng}
              onSelect={handleSelect}
              onShouldRefetch={call}
              markers={markers}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
