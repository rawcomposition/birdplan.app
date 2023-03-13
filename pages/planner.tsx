import React from "react";
import Sidebar from "components/sidebar";
import Head from "next/head";
import useProfile from "hooks/useProfile";
import MapBox from "components/Mapbox";

export default function Planner() {
  const { lifelist, radius, address, setRadius } = useProfile();

  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showSeen, setShowSeen] = React.useState(false);

  const lat = 20.652816318357367;
  const lng = -87.67056139518648;

  return (
    <div className="flex h-screen">
      <Head>
        <title>Find rare birds near you</title>
      </Head>

      <Sidebar open={showSidebar}>Hola</Sidebar>

      <div className="h-screen grow" onClick={() => setShowSidebar(false)}>
        <div className="w-full h-full">
          <MapBox lat={lat} lng={lng} />
        </div>
      </div>
    </div>
  );
}
