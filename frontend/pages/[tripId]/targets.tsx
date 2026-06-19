import React from "react";
import Header from "components/Header";
import Head from "next/head";
import MapBox from "components/Mapbox";
import { useModal } from "providers/modals";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import toast from "react-hot-toast";
import { useTrip } from "providers/trip";
import SpeciesCard from "components/SpeciesCard";
import Button from "components/Button";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import Input from "components/Input";
import ErrorBoundary from "components/ErrorBoundary";
import useTargetView from "hooks/useTargetView";
import useMutualTargets from "hooks/useMutualTargets";
import TargetViewToggle from "components/TargetViewToggle";
import NotFound from "components/NotFound";
import TargetRow from "components/TargetRow";
import useDownloadTargets from "hooks/useDownloadTargets";
import Icon from "components/Icon";
import clsx from "clsx";
const PAGE_SIZE = 100;

export default function TripTargets() {
  const { open, close } = useModal();
  const { user } = useUser();
  const { is404, trip, selectedSpecies } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: selectedSpecies?.code });

  // Filter options
  const [search, setSearch] = React.useState("");
  const [showStarred, setShowStarred] = React.useState(false);
  const [showMutual, setShowMutual] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const showCount = page * PAGE_SIZE;

  // Fetch targets from OpenBirding
  const {
    data: regionData,
    isLoading: isLoadingTargets,
    error: targetsError,
    refetch: refetchTargets,
  } = useDownloadTargets({
    region: trip?.region,
    startMonth: trip?.startMonth,
    endMonth: trip?.endMonth,
    enabled: !!trip,
  });

  const { lifelist } = useTargetView(trip);
  const { isGroup, isMutual } = useMutualTargets(trip);
  const targetSpecies = regionData?.items?.filter((it) => !lifelist.includes(it.code)) || [];

  // Filter targets
  const filteredTargets = targetSpecies?.filter(
    (it) =>
      it.name.toLowerCase().includes(search.toLowerCase()) &&
      (showStarred ? trip?.targetStars?.includes(it.code) : true) &&
      (showMutual && isGroup ? isMutual(it.code) : true)
  );

  const truncatedTargets = filteredTargets?.slice(0, showCount);

  const obsClick = (id: string) => {
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
      <main className="flex h-[calc(100%-60px-55px)] relative bg-gray-50">
        <ErrorBoundary>
          <div className="h-full overflow-auto w-full">
            <div className="h-full grow flex sm:relative flex-col w-full">
              <div className="h-full w-full mx-auto max-w-6xl px-2 sm:px-6 py-2 sm:py-4">
                {isLoadingTargets && (
                  <div className="flex items-center flex-col gap-2 my-8">
                    <Icon name="loading" className="animate-spin text-4xl text-blue-500" />
                    <p className="text-sm text-slate-600">Loading targets...</p>
                  </div>
                )}
                {targetsError && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center mt-4 space-y-2">
                    <h3 className="text-lg font-medium text-gray-700">Error loading targets</h3>
                    <Button color="link" onClick={() => refetchTargets()}>
                      Try Again
                    </Button>
                  </div>
                )}
                {!!targetSpecies?.length && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="relative w-full sm:flex-1 sm:max-w-sm">
                      <Icon
                        name="search"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                      />
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search species"
                        className="w-full h-9 pl-9 pr-3 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 shadow-sm outline-blue-500 outline-offset-0 focus:border-slate-400"
                      />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setShowStarred(!showStarred)}
                        aria-pressed={showStarred}
                        className={clsx(
                          "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium whitespace-nowrap shadow-sm",
                          showStarred
                            ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <Icon
                          name={showStarred ? "star" : "starOutline"}
                          className={showStarred ? "text-yellow-500" : "text-gray-400"}
                        />
                        Starred
                      </button>
                      {isGroup && (
                        <button
                          type="button"
                          onClick={() => setShowMutual(!showMutual)}
                          aria-pressed={showMutual}
                          title="Show only targets that everyone in your group still needs"
                          className={clsx(
                            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium whitespace-nowrap shadow-sm",
                            showMutual
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <Icon
                            name={showMutual ? "userFriends" : "userFriendsOutline"}
                            className={showMutual ? "text-emerald-600" : "text-gray-400"}
                          />
                          Mutual
                        </button>
                      )}
                      <TargetViewToggle trip={trip} align="left" />
                    </div>
                    <div className="ml-auto text-xs text-gray-500 hidden sm:block tabular-nums">
                      {filteredTargets?.length} species
                    </div>
                  </div>
                )}
                {!!regionData?.items?.length && !truncatedTargets?.length && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center mt-4">
                    <h3 className="text-lg font-medium mb-2 text-gray-700">No targets found</h3>
                    <p className="text-gray-500 text-sm">
                      {showStarred || (showMutual && isGroup) || search
                        ? "Try clearing your filters."
                        : "It looks like you have already seen all the species in this region."}
                    </p>
                  </div>
                )}
                {!isLoadingTargets && !targetsError && !regionData?.items?.length && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center mt-4 space-y-2">
                    <h3 className="text-lg font-medium text-gray-700">No target data available for this region</h3>
                  </div>
                )}
                {!!truncatedTargets?.length && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="hidden sm:table-header-group bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5 px-4 w-0">
                            #
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5 w-[4.3rem] lg:w-20">
                            Image
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5">
                            Species
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5 w-[150px] md:w-[200px] lg:w-[300px] hidden md:table-cell">
                            Notes
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5 md:w-20 lg:w-24">
                            Frequency
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5 md:w-32 lg:w-40 hidden md:table-cell">
                            Chart
                          </th>
                          <th className="text-left text-gray-500 font-semibold uppercase tracking-wide text-[11px] py-2.5">
                            Last seen
                          </th>
                          <th className="w-0" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 [&>tr:first-child>td]:pt-1 [&>tr:last-child>td]:pb-1">
                        {truncatedTargets?.map((it, index) => (
                          <TargetRow
                            key={it.code}
                            {...it}
                            index={index}
                            samples={regionData?.samples}
                            isMutual={isMutual(it.code)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="my-4 text-center pb-4">
                  {filteredTargets?.length > showCount && (
                    <button type="button" className="text-link font-bold text-sm" onClick={() => setPage(page + 1)}>
                      Show {Math.min(filteredTargets.length - showCount, PAGE_SIZE)} more
                    </button>
                  )}
                </div>
                {regionData?.citation && (
                  <p className="text-gray-400 text-xs text-center pb-6 px-4">{regionData.citation}</p>
                )}
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
                    obsLayer={selectedSpecies && obsLayer}
                    bounds={trip.bounds}
                  />
                )}
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
