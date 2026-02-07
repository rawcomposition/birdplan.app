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
import { Menu, Transition } from "@headlessui/react";
import { Editor, Target } from "@birdplan/shared";
import { useHotspotTargets } from "providers/hotspot-targets";
import { calculateSpeciesCoverage, getMarkerColorIndex, isLowCoverageSpecies } from "lib/helpers";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import clsx from "clsx";
import MapButton from "components/MapButton";
import Icon from "components/Icon";

const PAGE_SIZE = 50;
const EXPORT_THRESHOLD_OPTIONS = [1, 2, 5, 10] as const;
const DEFAULT_EXPORT_THRESHOLD = 2;

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildExportCsv(rows: { name: string; percent: number }[]): string {
  const header = "Species,% chance";
  const body = rows
    .map((r) => `${escapeCsvField(r.name)},${r.percent.toFixed(1)}`)
    .join("\n");
  return `${header}\n${body}`;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

  // Export options
  const [exportScope, setExportScope] = React.useState<"targets" | "all">("targets");
  const [exportThreshold, setExportThreshold] = React.useState(DEFAULT_EXPORT_THRESHOLD);

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

  const exportRows = React.useMemo(() => {
    if (exportScope === "targets") {
      if (!targetSpecies?.length) return [];
      return targetSpecies
        .map((it) => {
          const coverage = speciesCoverage.get(it.code);
          const effectivePercent =
            coverage && coverage.hotspotCount > 0 ? coverage.weightedAvgPercent : it.percent;
          return { name: it.name, percent: effectivePercent };
        })
        .filter((r) => r.percent >= exportThreshold)
        .sort((a, b) => b.percent - a.percent);
    }
    const codeToName = new Map<string, string>();
    for (const t of allTargets) {
      for (const item of t.items ?? []) {
        if (!codeToName.has(item.code)) codeToName.set(item.code, item.name);
      }
    }
    return [...speciesCoverage.entries()]
      .filter(([, cov]) => cov.weightedAvgPercent >= exportThreshold)
      .map(([code, cov]) => ({ name: codeToName.get(code) ?? code, percent: cov.weightedAvgPercent }))
      .sort((a, b) => b.percent - a.percent);
  }, [
    exportScope,
    exportThreshold,
    targetSpecies,
    speciesCoverage,
    allTargets,
  ]);

  const handleDownloadCsv = () => {
    if (exportRows.length === 0) {
      toast.error(
        exportScope === "targets"
          ? "No target species meet the minimum % threshold."
          : "No species at trip hotspots meet the minimum % threshold."
      );
      return;
    }
    const csv = buildExportCsv(exportRows);
    const slug = trip?.name?.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "targets";
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `birdplan-${slug}-${date}.csv`);
    toast.success("CSV downloaded");
  };

  const canExport = (targetSpecies?.length ?? 0) > 0 || speciesCoverage.size > 0;

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
      !target.closest(".mapboxgl-canvas") &&
      !target.closest(".mapboxgl-map")
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
                    {canExport && (
                      <Menu as="div" className="relative">
                        <Menu.Button
                          type="button"
                          className="inline-flex items-center gap-1.5 py-2 px-3 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded"
                        >
                          <Icon name="export" />
                          Export
                        </Menu.Button>
                        <Transition
                          as={React.Fragment}
                          enter="transition duration-200 ease-out"
                          enterFrom="scale-95 opacity-0"
                          enterTo="scale-100 opacity-100"
                          leave="transition duration-150 ease-in"
                          leaveFrom="scale-100 opacity-100"
                          leaveTo="scale-95 opacity-0"
                        >
                          <Menu.Items className="absolute left-0 top-full mt-1 z-50 min-w-[280px] origin-top-left rounded-lg bg-white ring-1 ring-black/5 shadow-lg py-3 px-4 space-y-3">
                            <div className="text-sm font-medium text-gray-700">Export as CSV</div>
                            <div className="space-y-2">
                              <span className="text-xs text-gray-500 block">Scope</span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="exportScope"
                                  checked={exportScope === "targets"}
                                  onChange={() => setExportScope("targets")}
                                  className="text-sky-600"
                                />
                                <span className="text-sm">Target species only</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="exportScope"
                                  checked={exportScope === "all"}
                                  onChange={() => setExportScope("all")}
                                  className="text-sky-600"
                                />
                                <span className="text-sm">All species at trip hotspots</span>
                              </label>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 block mb-1">Minimum % chance</span>
                              <select
                                value={exportThreshold}
                                onChange={(e) => setExportThreshold(Number(e.target.value))}
                                className="block w-full rounded border border-gray-300 text-sm py-1.5 px-2 text-gray-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                              >
                                {EXPORT_THRESHOLD_OPTIONS.map((n) => (
                                  <option key={n} value={n}>
                                    {n}%
                                  </option>
                                ))}
                              </select>
                            </div>
                            <Menu.Item>
                              {({ close }) => (
                                <Button
                                  color="primary"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    handleDownloadCsv();
                                    close();
                                  }}
                                >
                                  Download CSV
                                </Button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
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
