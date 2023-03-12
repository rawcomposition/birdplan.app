import React from "react";
import Sidebar from "components/sidebar";
import SpeciesList from "components/SpeciesList";
import Skeleton from "components/Skeleton";
import LocationSelect from "components/LocationSelect";
import useFetchSpecies from "hooks/useFetchSpecies";
import WelcomeMessage from "components/WelcomeMessage";
import SidebarToggle from "components/SidebarToggle";
import NoResults from "components/NoResults";
import FetchError from "components/FetchError";
import ResultsInfo from "components/ResultsInfo";
import MainContent from "components/MainContent";
import Head from "next/head";
import useProfile from "hooks/useProfile";

export default function Home() {
  const { lifelist, radius, address, setRadius, setAddress, appendLifelist, removeLifelist } = useProfile();
  const { lat, lng } = address || {};

  const { species, loading, error, lastUpdate, call } = useFetchSpecies({
    lat: lat || null,
    lng: lng || null,
    radius,
  });

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [fading, setFading] = React.useState<string[]>([]);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showSeen, setShowSeen] = React.useState(false);

  React.useEffect(() => {
    if (lat && lng) call();
  }, [lat, lng, radius, call]);

  const handleToggleExpand = (code: string) => {
    if (expanded.includes(code)) {
      setExpanded(expanded.filter((value) => value !== code));
    } else {
      setExpanded([...expanded, code]);
    }
  };

  const handleRemoveLifelist = (code: string) => {
    setFading((current) => [...current, code]);
    setTimeout(() => removeLifelist(code), 500);
  };

  const filteredSpecies = species?.filter(({ code }) => showSeen || !lifelist.includes(code));

  const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && !error;

  return (
    <div className="flex h-screen">
      <Head>
        <title>Find rare birds near you</title>
      </Head>

      <Sidebar
        seenCount={lifelist.length}
        showSeen={showSeen}
        radius={radius}
        open={showSidebar}
        onShowSeenChange={(value) => setShowSeen(value)}
        onRadiusChange={(value) => setRadius(value)}
      />

      <div className="h-screen overflow-auto grow pt-6 px-4" onClick={() => setShowSidebar(false)}>
        <div className="container mx-auto max-w-xl">
          {!lat || (!lng && <WelcomeMessage />)}

          <div className="flex mb-4">
            <LocationSelect className="w-full mt-6" value={address} onChange={setAddress} />
            <SidebarToggle onClick={() => setShowSidebar(!showSidebar)} />
          </div>

          {error && <FetchError reload={call} />}

          {loading && <Skeleton count={3} />}

          {showNoResults && <NoResults reload={call} />}

          {lat && lng && !!filteredSpecies?.length && (
            <SpeciesList
              items={filteredSpecies}
              onToggleExpand={handleToggleExpand}
              onAddSeen={appendLifelist}
              onRemoveSeen={handleRemoveLifelist}
              fading={fading}
              lifelist={lifelist}
              expanded={expanded}
              lat={lat}
              lng={lng}
            />
          )}

          {!!filteredSpecies?.length && (
            <ResultsInfo
              count={filteredSpecies.length}
              total={species?.length || 0}
              onReload={call}
              lastUpdate={lastUpdate?.toString()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
