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
import Head from "next/head";
import useProfile from "hooks/useProfile";
import Select from "react-select";
import { radiusOptions } from "lib/helpers";

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

  const handleSeen = (code: string) => {
    setFading((current) => [...current, code]);
    setTimeout(() => appendLifelist(code), 1000);
  };

  const filteredSpecies = species?.filter(({ code }) => showSeen || !lifelist.includes(code));

  const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && !error;

  const selectedRadius = radius ? radiusOptions.find(({ value }) => value == radius) : null;

  return (
    <div className="flex h-screen">
      <Head>
        <title>Find rare birds near you</title>
      </Head>

      <Sidebar open={showSidebar}>
        <div className="mt-4">
          <label htmlFor="radius" className="text-white text-sm">
            Radius
          </label>
          <Select
            instanceId="radius-select"
            options={radiusOptions}
            value={selectedRadius}
            onChange={(option) => setRadius(option?.value || radiusOptions[4].value)}
            defaultValue={radiusOptions[3]}
            placeholder="Select radius..."
          />
        </div>
        <div className="mt-4">
          <label className="text-white text-sm">
            <input type="checkbox" className="mr-2" checked={!showSeen} onChange={() => setShowSeen(!showSeen)} />
            &nbsp; Hide species I&apos;ve seen ({lifelist.length})
          </label>
        </div>
      </Sidebar>

      <div className="h-screen overflow-auto grow pt-6 px-4" onClick={() => setShowSidebar(false)}>
        <div className="container mx-auto max-w-xl">
          {(!lat || !lng) && <WelcomeMessage />}

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
              onAddSeen={handleSeen}
              onRemoveSeen={removeLifelist}
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
