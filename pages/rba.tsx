import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import SpeciesList from "components/rba/SpeciesList";
import Skeleton from "components/rba/Skeleton";
import LocationSelect from "components/LocationSelect";
import useFetchRBA from "hooks/useFetchRBA";
import WelcomeMessage from "components/rba/WelcomeMessage";
import NoResults from "components/rba/NoResults";
import FetchError from "components/rba/FetchError";
import ResultsInfo from "components/rba/ResultsInfo";
import Head from "next/head";
import { useProfile } from "providers/profile";
import Select from "components/ReactSelectStyled";
import { radiusOptions } from "lib/helpers";
import { useUI } from "providers/ui";
import Expand from "components/Expand";
import Button from "components/Button";
import { useModal } from "providers/modals";
import LoginModal from "components/LoginModal";

export default function Rba() {
  const { closeSidebar } = useUI();
  const { open } = useModal();
  const { countryLifelist, radius, address, setRadius, setAddress } = useProfile();
  const { lat, lng } = address || {};

  const { species, loading, error, lastUpdate, call } = useFetchRBA({
    lat: lat || null,
    lng: lng || null,
    radius,
  });

  const [expanded, setExpanded] = React.useState<string[]>([]);
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

  const filteredSpecies = species?.filter(({ code }) => showSeen || !countryLifelist.includes(code));

  const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && !error;

  const selectedRadius = radius ? radiusOptions.find(({ value }) => value == radius) : null;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Find rare birds near you</title>
      </Head>

      <Header title="Rare Bird Alert" />
      <main className="flex h-[calc(100%-60px)]">
        <Sidebar>
          <div>
            <label htmlFor="radius" className="text-white text-sm">
              Radius
            </label>
            <Select
              instanceId="radius-select"
              options={radiusOptions}
              value={selectedRadius}
              onChange={(option: any) => setRadius(option?.value || radiusOptions[4].value)}
              defaultValue={radiusOptions[3]}
              placeholder="Select radius..."
            />
          </div>
          <div className="mt-4">
            <label className="text-white text-sm">
              <input type="checkbox" className="mr-2" checked={!showSeen} onChange={() => setShowSeen(!showSeen)} />
              &nbsp; Hide species I&apos;ve seen
            </label>
          </div>
          <div className="-mx-6 mt-6 mb-8">
            <Expand heading="US Life List" count={countryLifelist?.length} className="text-white">
              <Button size="sm" color="primary" onClick={() => open("uploadLifelist", { isCountry: true })}>
                Import Life List
              </Button>
            </Expand>
          </div>
        </Sidebar>

        <div className="h-full overflow-auto grow pt-6 px-4 pb-6" onClick={closeSidebar}>
          <div className="container mx-auto max-w-xl">
            {(!lat || !lng) && <WelcomeMessage />}

            <LocationSelect className="w-full mb-6" value={address || null} onChange={setAddress} justUSA />

            {error && <FetchError reload={call} />}

            {loading && <Skeleton count={3} />}

            {showNoResults && <NoResults reload={call} />}

            {lat && lng && !!filteredSpecies?.length && (
              <SpeciesList
                items={filteredSpecies}
                onToggleExpand={handleToggleExpand}
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
      </main>
      <LoginModal />
    </div>
  );
}
