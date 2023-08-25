import React from "react";
import Sidebar from "components/Sidebar";
import Header from "components/Header";
import SpeciesList from "components/rba/SpeciesList";
import Skeleton from "components/rba/Skeleton";
import useFetchRBA from "hooks/useFetchRBA";
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
import LoginModal from "components/LoginModal";
import { toast } from "react-hot-toast";
import { debounce } from "lib/helpers";

export default function Rba() {
  const { closeSidebar } = useUI();
  const { countryLifelist, radius, lat, lng, setRadius, setLat, setLng } = useProfile();

  const { species, loading, error, lastUpdate, call } = useFetchRBA({
    lat: lat || null,
    lng: lng || null,
  });

  console.log(lat, lng);

  const [expanded, setExpanded] = React.useState<string[]>([]);

  React.useEffect(() => {
    call();
  }, [call]);

  const handleLatChange = debounce(setLat, 1000);
  const handleLngChange = debounce(setLng, 1000);

  const handleToggleExpand = (code: string) => {
    if (expanded.includes(code)) {
      setExpanded(expanded.filter((value) => value !== code));
    } else {
      setExpanded([...expanded, code]);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const toastId = toast.loading("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLat(coords.latitude);
          setLng(coords.longitude);
          toast.dismiss(toastId);
        },
        (error) => {
          toast.dismiss(toastId);
          toast.error(error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const filteredSpecies = species?.filter(({ code }) => !countryLifelist.includes(code));

  const showNoResults = lat && lng && !loading && species !== null && filteredSpecies?.length === 0 && !error;

  const selectedRadius = radius ? radiusOptions.find(({ value }) => value == radius) : null;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>US Lower 48 Rare Bird Alert</title>
      </Head>

      <Header title="US Lower 48 Rare Bird Alert" />
      <main className="flex h-[calc(100%-60px)]">
        <Sidebar>
          <div className="mb-6">
            <label htmlFor="lat" className="text-gray-300 mb-2 font-medium block">
              My Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="lat"
                name="lat"
                defaultValue={lat || ""}
                className="input"
                placeholder="Latitude"
                onChange={(e) => handleLatChange(+e.target.value)}
              />
              <input
                type="text"
                id="lng"
                name="lng"
                defaultValue={lng || ""}
                className="input"
                placeholder="Longitude"
                onChange={(e) => handleLngChange(+e.target.value)}
              />
            </div>
            <button
              className="text-gray-300 text-[13px] rounded flex items-center justify-center gap-2 mt-2"
              onClick={getCurrentLocation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" className="icon text-sky-600">
                <path d="M256 168c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 128c-22.06 0-40-17.94-40-40s17.94-40 40-40 40 17.94 40 40-17.94 40-40 40zm240-64h-49.66C435.49 145.19 366.81 76.51 280 65.66V16c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v49.66C145.19 76.51 76.51 145.19 65.66 232H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h49.66C76.51 366.81 145.19 435.49 232 446.34V496c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-49.66C366.81 435.49 435.49 366.8 446.34 280H496c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16zM256 400c-79.4 0-144-64.6-144-144s64.6-144 144-144 144 64.6 144 144-64.6 144-144 144z" />
              </svg>
              Use Current Location
            </button>
            {lat && lng && (
              <img
                className="mt-2 rounded-md"
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},9,0/320x200@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_KEY}`}
              />
            )}
          </div>
          <div>
            <label htmlFor="radius" className="text-gray-300 mb-2 font-medium block">
              Highlight Reports Within
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
          <div className="-mx-6 mt-6 mb-8">
            <Expand heading="US Life List" count={countryLifelist?.length} className="text-white">
              <Button size="sm" color="primary" href="/import-lifelist?isCountry=true">
                Import Life List
              </Button>
            </Expand>
          </div>
        </Sidebar>

        <div className="h-full overflow-auto grow pt-6 px-4 pb-6" onClick={closeSidebar}>
          <div className="container mx-auto max-w-xl">
            {error && <FetchError reload={call} />}

            {loading && <Skeleton count={3} />}

            {showNoResults && <NoResults reload={call} />}

            {!!filteredSpecies?.length && (
              <SpeciesList
                items={filteredSpecies}
                onToggleExpand={handleToggleExpand}
                expanded={expanded}
                lat={lat}
                lng={lng}
                radius={radius}
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
