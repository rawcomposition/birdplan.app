import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { useQuery } from "@tanstack/react-query";
import { useDebounceCallback } from "usehooks-ts";
import BackLink from "components/BackLink";
import { Alert } from "components/ui/alert";
import EmptyState from "components/EmptyState";
import LoadingState from "components/LoadingState";
import SpeciesMapOverlay from "components/SpeciesMapOverlay";
import { Card } from "components/ui/card";
import SpeciesHero from "components/SpeciesHero";
import SpeciesHotspotToolbar, { type SortKey } from "components/SpeciesHotspotToolbar";
import SpeciesHotspotList, { type HotspotItem, type MonthMode } from "components/SpeciesHotspotList";
import { useTrip } from "hooks/useTrip";
import useTripLifelist from "hooks/useTripLifelist";
import useMutualTargets from "hooks/useMutualTargets";
import { useModal } from "stores/modals";
import useCloseOnOutsideClick from "hooks/useCloseOnOutsideClick";
import useDownloadTargets from "hooks/useDownloadTargets";
import useFetchSpeciesObs from "hooks/useFetchSpeciesObs";
import useTripMutation from "hooks/useTripMutation";
import { OPENBIRDING_API_URL } from "lib/config";
import { dateTimeToRelative } from "lib/helpers";
import { getMonthRange } from "lib/targets";
import { useSpeciesHotspotPreferences } from "stores/speciesHotspotPreferences";
import type { OpenBirdingHotspotRankingResponse } from "@birdplan/shared";

export default function SpeciesDetail() {
  const { speciesCode = "" } = useParams();
  const { trip, canEdit, setSelectedSpecies, dateRangeLabel } = useTrip();
  const { myLifelist } = useTripLifelist(trip);
  const { isMutual } = useMutualTargets(trip);
  const { open } = useModal();
  const handleContainerClick = useCloseOnOutsideClick();

  const [monthMode, setMonthMode] = React.useState<MonthMode>("all");
  const [nowMs] = React.useState(() => Date.now());
  const { scope, setScope, sort, setSort, minObservations, setMinObservations, recentDays, setRecentDays } =
    useSpeciesHotspotPreferences();

  const { data: regionData } = useDownloadTargets({
    region: trip?.region,
    startMonth: trip?.startMonth,
    endMonth: trip?.endMonth,
    enabled: !!trip,
  });

  const target = regionData?.items?.find((it) => it.code === speciesCode);
  const speciesName = target?.name || "";

  const isStarred = !!trip?.targetStars?.includes(speciesCode);
  const isSeen = myLifelist.includes(speciesCode);

  const setNotesMutation = useTripMutation<{ code: string; notes: string }>({
    url: `/trips/${trip?._id}/targets/set-notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetNotes: { ...(old.targetNotes || {}), [input.code]: input.notes },
    }),
  });

  const { obs, obsLayer } = useFetchSpeciesObs({ region: trip?.region, code: speciesCode });
  const regionCode = trip?.region.split(",")[0] || "";

  const lastSeenByLocId: Record<string, string> = {};
  obs.forEach((o) => {
    if (!o.obsDt) return;
    const existing = lastSeenByLocId[o.id];
    if (!existing || o.obsDt > existing) lastSeenByLocId[o.id] = o.obsDt;
  });

  const savedHotspots = trip?.hotspots || [];
  const locationIds = savedHotspots.map((it) => it.id);
  const hasSavedHotspots = locationIds.length > 0;
  const savedIdSet = new Set(locationIds);

  const apiSortBy: "best" | "frequency" = sort === "freq" ? "frequency" : "best";
  const months = trip ? getMonthRange(trip.startMonth, trip.endMonth) : undefined;

  let recentLocIds: string[] | null = null;
  if (recentDays != null) {
    const cutoff = new Date(nowMs - recentDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const ids = new Set<string>();
    for (const o of obs) if (o.obsDt && o.obsDt >= cutoff) ids.add(o.id);
    recentLocIds = [...ids];
  }

  let scopedLocationIds: string[] | null = null;
  if (recentLocIds && scope === "saved") {
    scopedLocationIds = recentLocIds.filter((id) => savedIdSet.has(id));
  } else if (recentLocIds) {
    scopedLocationIds = recentLocIds;
  } else if (scope === "saved") {
    scopedLocationIds = locationIds;
  }

  const queryBody = {
    sortBy: apiSortBy,
    ...(monthMode === "trip" && months ? { months } : {}),
    ...(minObservations > 1 ? { minObservations } : {}),
    ...(scopedLocationIds ? { locationIds: scopedLocationIds } : { region: trip?.region, limit: 500 }),
  };

  const queryEnabled =
    !!speciesCode && !!OPENBIRDING_API_URL && (scopedLocationIds ? scopedLocationIds.length > 0 : !!trip?.region);

  const {
    data: rankings,
    isLoading: loadingRankings,
    isFetching: fetchingRankings,
    isError: rankingsError,
    refetch: refetchRankings,
  } = useQuery<OpenBirdingHotspotRankingResponse>({
    queryKey: ["openbirding-best-hotspots", speciesCode, scope, queryBody],
    queryFn: async () => {
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/species/${speciesCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody),
      });
      if (!res.ok) throw new Error("Failed to fetch hotspot rankings");
      return res.json();
    },
    enabled: queryEnabled,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  const hotspotNameById = new Map(savedHotspots.map((h) => [h.id, h.name]));
  const hotspotItems: HotspotItem[] = (rankings?.items || []).map((it) => {
    const obsDt = lastSeenByLocId[it.id];
    return {
      ...it,
      name: hotspotNameById.get(it.id) || it.name,
      saved: savedIdSet.has(it.id),
      lastSeen: obsDt ? dateTimeToRelative(obsDt, regionCode, true) : "> 30 days ago",
    };
  });

  const filtered = hotspotItems.slice();
  const cmp: Record<SortKey, (a: HotspotItem, b: HotspotItem) => number> = {
    best: (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
    freq: (a, b) => b.frequency - a.frequency,
  };
  filtered.sort(cmp[sort]);

  const canMutate = canEdit && !!target;

  const persistedNotes = trip?.targetNotes?.[speciesCode] || "";
  const notesKey = `${trip?._id}|${speciesCode}`;
  const [tempNotes, setTempNotes] = React.useState(persistedNotes);
  const [seededKey, setSeededKey] = React.useState(notesKey);

  if (notesKey !== seededKey) {
    setSeededKey(notesKey);
    setTempNotes(persistedNotes);
  }

  const saveNotes = React.useCallback(
    (notes: string) => {
      if (!canMutate || !speciesCode || notes === persistedNotes) return;
      setNotesMutation.mutate({ code: speciesCode, notes });
    },
    [canMutate, persistedNotes, setNotesMutation, speciesCode],
  );

  const debouncedSaveNotes = useDebounceCallback(saveNotes, 1500);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextNotes = e.target.value;
    setTempNotes(nextNotes);
    debouncedSaveNotes(nextNotes);
  };

  const handleNotesBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const nextNotes = e.target.value;
    debouncedSaveNotes.cancel();
    saveNotes(nextNotes);
  };

  const monthly =
    target?.obs && regionData?.samples
      ? target.obs.map((o, i) => {
          const s = regionData.samples[i] || 0;
          return s > 0 ? Math.round((o / s) * 1000) / 10 : 0;
        })
      : Array(12).fill(0);

  const handleHotspotClick = (id: string) => {
    const hotspot = trip?.hotspots?.find((it) => it.id === id);
    const ranked = rankings?.items?.find((it) => it.id === id);
    if (!hotspot && !ranked) return;
    open("hotspot", { hotspot: hotspot || ranked });
  };

  const handleShowMap = () => {
    if (!speciesCode) return;
    setSelectedSpecies({ code: speciesCode, name: speciesName || speciesCode });
  };

  const obsClick = (id: string) => {
    const observation = obs.find((it) => it.id === id);
    if (!observation) return toast.error("Observation not found");
    open(observation.isPersonal ? "personalLocation" : "hotspot", {
      hotspot: observation,
      speciesCode,
      speciesName,
    });
  };

  return (
    <>
      {trip && speciesName && <title>{`${speciesName} | ${trip.name} | BirdPlan.app`}</title>}
      <div className="absolute inset-0 overflow-auto" onClick={handleContainerClick}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20">
          <BackLink to={`/${trip?._id}/targets`} label="Back to targets" className="mb-4" />

          {!target && regionData?.items && (
            <Alert variant="warning">Species not found in this region&apos;s targets.</Alert>
          )}

          <SpeciesHero
            name={speciesName || speciesCode}
            code={speciesCode}
            scientificName={target?.sciName}
            starred={isStarred}
            mutual={isMutual(speciesCode)}
            seen={isSeen}
            monthly={monthly}
            onShowMap={handleShowMap}
          />

          <Card className="mt-4 px-4 py-3 focus-within:outline-solid focus-within:outline-2 focus-within:outline-blue-500 focus-within:outline-offset-0">
            <label
              htmlFor="species-notes"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Notes
            </label>
            <TextareaAutosize
              id="species-notes"
              placeholder="Add notes about this species..."
              value={tempNotes}
              onChange={handleNotesChange}
              onBlur={handleNotesBlur}
              readOnly={!canMutate}
              minRows={1}
              maxRows={10}
              className="block w-full resize-none overflow-hidden border-none bg-transparent text-sm leading-6 text-foreground outline-hidden"
            />
          </Card>

          <div className="mt-8 flex flex-col gap-4">
            <SpeciesHotspotToolbar
              scope={scope}
              setScope={setScope}
              sort={sort}
              setSort={setSort}
              minObservations={minObservations}
              setMinObservations={setMinObservations}
              recentDays={recentDays}
              setRecentDays={setRecentDays}
            />

            {scope === "saved" && !hasSavedHotspots && (
              <Alert variant="warning">You have not saved any hotspots for this trip.</Alert>
            )}
            {recentDays != null && scopedLocationIds?.length === 0 && (
              <Alert variant="warning">
                No {scope === "saved" ? "saved hotspots" : "hotspots"} have had a sighting in the last {recentDays}{" "}
                days.
              </Alert>
            )}
            {rankingsError && (
              <EmptyState
                variant="destructive"
                title="Failed to load hotspot rankings"
                onRetry={() => refetchRankings()}
              />
            )}
            {queryEnabled && loadingRankings && !rankings && (
              <LoadingState label="Loading hotspot rankings…" className="py-4" />
            )}

            {queryEnabled && !rankingsError && rankings && filtered.length === 0 && (
              <EmptyState title="No hotspots match these filters." />
            )}
            {queryEnabled && !rankingsError && rankings && filtered.length > 0 && (
              <SpeciesHotspotList
                hotspots={filtered}
                onSelect={handleHotspotClick}
                monthMode={monthMode}
                setMonthMode={setMonthMode}
                tripRangeLabel={dateRangeLabel}
                loading={fetchingRankings}
              />
            )}

            {rankings?.citation && (
              <p className="text-muted-foreground text-xs text-center pt-2">{rankings.citation}</p>
            )}
          </div>
        </div>
      </div>
      <SpeciesMapOverlay onOutsideClick={handleContainerClick} onHotspotClick={obsClick} obsLayer={obsLayer} />
    </>
  );
}
