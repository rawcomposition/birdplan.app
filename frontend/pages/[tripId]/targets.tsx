import React from "react";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import Input from "components/Input";
import ErrorBoundary from "components/ErrorBoundary";
import { useProfile } from "providers/profile";
import Button from "components/Button";
import ProfileSelect from "components/ProfileSelect";
import NotFound from "components/NotFound";
import TargetRow from "components/TargetRow";
import { useQuery } from "@tanstack/react-query";
import { Editor, Target } from "@birdplan/shared";
import { useHotspotTargets } from "providers/hotspot-targets";
import { calculateSpeciesCoverage, getMarkerColorIndex, isLowCoverageSpecies } from "lib/helpers";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import clsx from "clsx";
import MapButton from "components/MapButton";
import Icon from "components/Icon";

const PAGE_SIZE = 50;

type SortColumn = "name" | "percent" | "lastSeen";
type SortDirection = "asc" | "desc";

export default function TripTargets() {
  const { open, close } = useModal();
  const { user } = useUser();
  const { is404, targets, trip, selectedSpecies, canEdit } = useTrip();
  const { allTargets } = useHotspotTargets();
  const [showPersonalLocations, setShowPersonalLocations] = React.useState(false);
  const { obs, obsLayer, hasFrequencyData } = useFetchSpeciesObs({
    region: trip?.region,
    code: selectedSpecies?.code,
    allTargets,
    showPersonalLocations,
  });

  // Filter options
  const [search, setSearch] = React.useState("");
  const [showStarred, setShowStarred] = React.useState(false);
  const [showHardToFind, setShowHardToFind] = React.useState(false);
  const [uid, setUid] = React.useState<string | undefined>();
  const [page, setPage] = React.useState(1);
  const showCount = page * PAGE_SIZE;

  // Sort options (default to descending by percent)
  const [sortColumn, setSortColumn] = React.useState<SortColumn>("percent");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  // Calculate species coverage across all hotspots
  const speciesCoverage = React.useMemo(() => calculateSpeciesCoverage(allTargets), [allTargets]);

  // Fetch recent species for last seen sorting
  const { recentSpecies } = useFetchRecentSpecies(trip?.region);

  // Exclude non-lifers
  const { lifelist: myLifelist } = useProfile();
  const { data: editors } = useQuery<Editor[]>({
    queryKey: [`/trips/${trip?._id}/editors`],
    enabled: !!trip?._id,
    refetchOnWindowFocus: false,
  });
  const myUid = user?.uid;
  const ownerId = trip?.ownerId;
  const lifelist = uid === myUid ? myLifelist : editors?.find((it) => it.uid === uid)?.lifelist || [];
  const targetSpecies = targets?.items?.filter((it) => !lifelist.includes(it.code)) || [];

  // Filter targets
  const filteredTargets = targetSpecies?.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) &&
      (showStarred ? trip?.targetStars?.includes(it.code) : true) &&
      (showHardToFind ? isLowCoverageSpecies(speciesCoverage.get(it.code)) : true)
  );

  // Sort targets
  const sortedTargets = React.useMemo(() => {
    if (!filteredTargets) return [];

    const getEffectivePercent = (target: Target) => {
      const coverage = speciesCoverage.get(target.code);
      return coverage && coverage.hotspotCount > 0 ? coverage.weightedAvgPercent : target.percent;
    };

    const getLastSeenDate = (code: string) => {
      const recent = recentSpecies?.find((s) => s.code === code);
      return recent?.date ? new Date(recent.date).getTime() : 0;
    };

    return [...filteredTargets].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "percent":
          comparison = getEffectivePercent(a) - getEffectivePercent(b);
          break;
        case "lastSeen":
          comparison = getLastSeenDate(a.code) - getLastSeenDate(b.code);
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredTargets, sortColumn, sortDirection, speciesCoverage, recentSpecies]);

  const truncatedTargets = sortedTargets?.slice(0, showCount);

  // Handle column header click
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return (
      <span className="ml-1 text-sky-600">
        {sortDirection === "desc" ? "↓" : "↑"}
      </span>
    );
  };

  const savedHotspotMarkers = React.useMemo(
    () =>
      (trip?.hotspots || []).map((it) => ({
        lat: it.lat,
        lng: it.lng,
        shade: getMarkerColorIndex(it.species || 0),
        id: it.id,
      })),
    [trip?.hotspots]
  );

  const obsClick = (id: string) => {
    const savedHotspot = trip?.hotspots?.find((it) => it.id === id);
    if (savedHotspot) {
      open("hotspot", {
        hotspot: savedHotspot,
        speciesCode: selectedSpecies?.code,
        speciesName: selectedSpecies?.name,
      });
      return;
    }
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    observation.isPersonal
      ? open(observation.isPersonal ? "personalLocation" : "hotspot", {
          hotspot: observation,
          speciesCode: selectedSpecies?.code,
          speciesName: selectedSpecies?.name,
        })
      : open("hotspot", { hotspot: observation, speciesName: selectedSpecies?.name });
  };

  React.useEffect(() => {
    if (!myUid && !ownerId) return;
    setUid(myUid || ownerId);
  }, [myUid, ownerId]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("button") &&
      !target.closest("a") &&
      !target.closest('[role="button"]') &&
      !target.closest(".mapboxgl-canvas")
    ) {
      close();
    }
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full" onClick={handleContainerClick}>
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <TripNav active="targets" />
      <main className="flex h-[calc(100%-60px-55px)] relative">
        <ErrorBoundary>
          <div className="h-full overflow-auto w-full">
            <div className="h-full grow flex sm:relative flex-col w-full">
              <div className="h-full w-full mx-auto max-w-6xl">
                <ProfileSelect value={uid} onChange={setUid} editors={editors} />
                {!!targetSpecies?.length && (
                  <div className="flex items-center gap-2 my-2 sm:my-4 px-2 sm:px-0">
                    <Input
                      type="search"
                      value={search}
                      onChange={(e: any) => setSearch(e.target.value)}
                      placeholder="Search species"
                      className="max-w-xs"
                    />
                    <label className="flex items-center gap-2 py-2 px-3 text-gray-600 text-sm">
                      <input
                        type="checkbox"
                        checked={showStarred}
                        onChange={() => setShowStarred(!showStarred)}
                        className="form-checkbox text-sky-600"
                      />
                      <span className="text-gray-600 text-sm">Starred</span>
                    </label>
                    {allTargets.length > 0 && (
                      <label
                        className="flex items-center gap-2 py-2 px-3 text-gray-600 text-sm"
                        title="Species with less than 15% frequency or fewer than 10 observations at all saved hotspots"
                      >
                        <input
                          type="checkbox"
                          checked={showHardToFind}
                          onChange={() => setShowHardToFind(!showHardToFind)}
                          className="form-checkbox text-sky-600"
                        />
                        <span className="text-gray-600 text-sm">Hard to find</span>
                      </label>
                    )}
                  </div>
                )}
                {!!targets?.N && !truncatedTargets?.length && (
                  <div className="sm:bg-white sm:rounded-lg sm:shadow p-4 text-center mt-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-700">No targets found</h3>
                    <p className="text-gray-500 text-sm">
                      {truncatedTargets?.length === truncatedTargets?.length
                        ? "It looks like you have already seen all the species in this region."
                        : "No targets found for your search."}
                    </p>
                  </div>
                )}
                {!targets?.N && !truncatedTargets?.length && (
                  <div className="sm:bg-white sm:rounded-lg sm:shadow p-4 text-center mt-4 space-y-2">
                    {canEdit ? (
                      <h3 className="text-lg font-medium text-gray-700">You haven&apos;t imported your targets yet</h3>
                    ) : (
                      <h3 className="text-lg font-medium text-gray-700">No targets have been imported yet</h3>
                    )}
                    {canEdit && (
                      <p>
                        <Button
                          href={`/${trip?._id}/import-targets?redirect=targets&back=true`}
                          color="primary"
                          size="sm"
                        >
                          Import Targets
                        </Button>
                      </p>
                    )}
                  </div>
                )}
                {!!truncatedTargets?.length && (
                  <table className="divide-y w-full">
                    <thead className="hidden sm:table-header-group">
                      <tr>
                        <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 px-4 w-0">#</th>
                        <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 w-[4.3rem] lg:w-20">
                          Image
                        </th>
                        <th
                          className={clsx(
                            "text-left text-gray-500 font-normal uppercase text-xs pb-1 cursor-pointer hover:text-gray-700 select-none",
                            sortColumn === "name" && "text-sky-600"
                          )}
                          onClick={() => handleSort("name")}
                        >
                          Species
                          <SortIndicator column="name" />
                        </th>
                        <th className="text-left text-gray-500 font-normal uppercase text-xs pb-1 w-0 hidden md:table-cell">
                          Notes
                        </th>
                        <th
                          className={clsx(
                            "text-left text-gray-500 font-normal uppercase text-xs pb-1 md:w-12 lg:w-20 cursor-pointer hover:text-gray-700 select-none",
                            sortColumn === "percent" && "text-sky-600"
                          )}
                          title="Weighted average frequency at your top saved hotspots"
                          onClick={() => handleSort("percent")}
                        >
                          %
                          <SortIndicator column="percent" />
                        </th>
                        <th
                          className={clsx(
                            "text-left text-gray-500 font-normal uppercase text-xs pb-1 cursor-pointer hover:text-gray-700 select-none",
                            sortColumn === "lastSeen" && "text-sky-600"
                          )}
                          onClick={() => handleSort("lastSeen")}
                        >
                          Last seen
                          <SortIndicator column="lastSeen" />
                        </th>
                        <th className="w-0" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {truncatedTargets?.map((it, index) => (
                        <TargetRow
                          key={it.code}
                          {...it}
                          index={index}
                          coverage={speciesCoverage.get(it.code)}
                        />
                      ))}
                    </tbody>
                  </table>
                )}

                <div className="my-4 text-center pb-4">
                  {sortedTargets?.length > showCount && (
                    <button type="button" className="text-sky-600 font-bold text-sm" onClick={() => setPage(page + 1)}>
                      Show {Math.min(sortedTargets.length - showCount, 50)} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {selectedSpecies && (
            <div className="absolute inset-0 z-10 flex flex-col">
              {selectedSpecies && <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />}
              <div className="w-full flex-grow relative">
                {trip?.bounds && (
                  <MapBox
                    key={trip._id}
                    onHotspotClick={obsClick}
                    markers={savedHotspotMarkers}
                    obsLayer={selectedSpecies && obsLayer}
                    hasFrequencyData={hasFrequencyData}
                    bounds={trip.bounds}
                  />
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                  <MapButton
                    onClick={() => setShowPersonalLocations((prev) => !prev)}
                    tooltip={showPersonalLocations ? "Hide personal hotspots" : "Show personal hotspots"}
                    active={showPersonalLocations}
                  >
                    <Icon name="user" />
                  </MapButton>
                </div>
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
