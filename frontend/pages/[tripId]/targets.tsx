import React from "react";
import MapBox from "components/Mapbox";
import { useModal } from "stores/modals";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import toast from "react-hot-toast";
import { useTrip } from "hooks/useTrip";
import SpeciesCard from "components/SpeciesCard";
import { Card } from "components/ui/card";
import EmptyState from "components/EmptyState";
import { Button } from "components/ui/button";
import useTargetView from "hooks/useTargetView";
import useMutualTargets from "hooks/useMutualTargets";
import TargetViewToggle from "components/TargetViewToggle";
import TargetsOptionsDropdown from "components/TargetsOptionsDropdown";
import TargetRow from "components/TargetRow";
import SearchInput from "components/SearchInput";
import FilterChip from "components/FilterChip";
import useDownloadTargets from "hooks/useDownloadTargets";
import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
const PAGE_SIZE = 100;

export default function TripTargets() {
  const { open, close } = useModal();
  const { trip, selectedSpecies } = useTrip();
  const { obs, obsLayer } = useFetchSpeciesObs({
    region: trip?.region,
    code: selectedSpecies?.code,
  });

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
      (showMutual && isGroup ? isMutual(it.code) : true),
  );

  const truncatedTargets = filteredTargets?.slice(0, showCount);

  const minPercent = regionData?.items?.length ? Math.min(...regionData.items.map((it) => it.frequency)) : 0;

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    if (observation.isPersonal) {
      open("personalLocation", {
        hotspot: observation,
        speciesCode: selectedSpecies?.code,
        speciesName: selectedSpecies?.name,
      });
    } else {
      open("hotspot", {
        hotspot: observation,
        speciesName: selectedSpecies?.name,
      });
    }
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

  return (
    <>
      {trip && <title>{`${trip.name} | BirdPlan.app`}</title>}
      <div className="h-full overflow-auto w-full" onClick={handleContainerClick}>
        <div className="h-full grow flex sm:relative flex-col w-full">
          <div className="h-full w-full mx-auto max-w-6xl px-2 sm:px-6 py-2 sm:py-4">
            {isLoadingTargets && (
              <div className="flex items-center flex-col gap-2 my-8">
                <Spinner className="size-9 text-primary" />
                <p className="text-sm text-muted-foreground">Loading targets...</p>
              </div>
            )}
            {!isLoadingTargets && !!trip && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search species"
                    className="w-full sm:flex-1 sm:max-w-sm"
                  />
                  <div className="flex items-start gap-2 sm:items-center sm:ml-auto">
                    <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3 sm:flex-none">
                      <FilterChip tone="amber" active={showStarred} onClick={() => setShowStarred(!showStarred)}>
                        <Icon
                          name={showStarred ? "star" : "starOutline"}
                          className={showStarred ? "text-yellow-500" : "text-muted-foreground"}
                        />
                        Starred
                      </FilterChip>
                      {isGroup && (
                        <FilterChip
                          tone="emerald"
                          active={showMutual}
                          onClick={() => setShowMutual(!showMutual)}
                          title="Show only targets that everyone in your group still needs"
                        >
                          <Icon
                            name={showMutual ? "userFriends" : "userFriendsOutline"}
                            className={showMutual ? "text-emerald-600" : "text-muted-foreground"}
                          />
                          Mutual
                        </FilterChip>
                      )}
                      <TargetViewToggle trip={trip} align="left" />
                    </div>
                    <TargetsOptionsDropdown trip={trip} />
                  </div>
                </div>
                {!!regionData?.items?.length && (
                  <p className="mb-2 sm:mb-3 text-sm text-secondary-foreground">
                    Found <span className="font-semibold text-foreground tabular-nums">{filteredTargets?.length}</span>{" "}
                    species above <span className="font-semibold text-foreground tabular-nums">{minPercent}%</span>
                  </p>
                )}
              </>
            )}
            {targetsError && (
              <EmptyState
                className="mt-4"
                title="Error loading targets"
                action={
                  <Button variant="link" onClick={() => refetchTargets()}>
                    Try Again
                  </Button>
                }
              />
            )}
            {!!regionData?.items?.length && !truncatedTargets?.length && (
              <EmptyState
                className="mt-4"
                title="No targets found"
                description={
                  showStarred || (showMutual && isGroup) || search
                    ? "Try clearing your filters."
                    : "It looks like you have already seen all the species in this region."
                }
              />
            )}
            {!isLoadingTargets && !targetsError && !regionData?.items?.length && (
              <EmptyState className="mt-4" title="No target data available for this region" />
            )}
            {!!truncatedTargets?.length && (
              <Card className="overflow-hidden">
                <table className="w-full">
                  <thead className="hidden sm:table-header-group bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5 px-4 w-0">
                        #
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5 w-[4.3rem] lg:w-20">
                        Image
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5">
                        Species
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5 w-[150px] md:w-[200px] lg:w-[300px] hidden md:table-cell">
                        Notes
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5 md:w-20 lg:w-24">
                        Frequency
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5 md:w-32 lg:w-40 hidden md:table-cell">
                        Chart
                      </th>
                      <th className="text-left text-muted-foreground font-semibold uppercase tracking-wide text-[11px] py-2.5">
                        Last seen
                      </th>
                      <th className="w-0" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 [&>tr:first-child>td]:pt-1 [&>tr:last-child>td]:pb-1">
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
              </Card>
            )}

            <div className="my-4 text-center pb-4">
              {filteredTargets?.length > showCount && (
                <Button variant="link" type="button" className="text-sm" onClick={() => setPage(page + 1)}>
                  Show {Math.min(filteredTargets.length - showCount, PAGE_SIZE)} more
                </Button>
              )}
            </div>
            {regionData?.citation && (
              <p className="text-muted-foreground/70 text-xs text-center pb-6 px-4">{regionData.citation}</p>
            )}
          </div>
        </div>
      </div>
      {selectedSpecies && (
        <div className="absolute inset-0 z-10 flex flex-col" onClick={handleContainerClick}>
          <SpeciesCard name={selectedSpecies.name} code={selectedSpecies.code} />
          <div className="w-full grow relative">
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
    </>
  );
}
