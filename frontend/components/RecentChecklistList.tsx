import React from "react";
import dayjs from "dayjs";
import { dateTimeToRelative } from "lib/helpers";
import { useTrip } from "hooks/useTrip";
import { Button } from "components/ui/button";
import useFetchRecentChecklists from "hooks/useFetchRecentChecklists";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import useFetchHotspotObs from "hooks/useFetchHotspotObs";
import useLocationTargets from "hooks/useLocationTargets";
import { RecentChecklist } from "lib/types";
import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
import ObsList from "components/ObsList";
import SelectDropdown from "components/SelectDropdown";
import { Alert } from "components/ui/alert";

type Props = {
  hotspotId: string;
  speciesCode?: string;
  speciesName?: string;
};

export default function RecentChecklistList({ hotspotId, speciesCode, speciesName }: Props) {
  const [view, setView] = React.useState<string>("all");
  const [expanded, setExpanded] = React.useState(false);
  const [showDatasetTip, setShowDatasetTip] = React.useState(false);
  const { trip } = useTrip();

  const { data: targets, isLoading: isLoadingTargets } = useLocationTargets(hotspotId);
  const { groupedChecklists, isLoading, error, refetch } = useFetchRecentChecklists(hotspotId);
  const { allSpecies, isLoading: isLoadingSpecies } = useFetchRecentSpecies(hotspotId);
  const { data: obs, error: obsError } = useFetchHotspotObs(trip?._id || "", hotspotId, speciesCode);

  const mergedChecklists = mergeSupplementalChecklists(groupedChecklists, allSpecies, trip?.region);
  const checklists = expanded ? mergedChecklists : mergedChecklists.slice(0, 10);

  const targetItem = speciesCode ? targets?.items.find((it) => it.code === speciesCode) : undefined;
  const totalSamples = targets?.samples.reduce((a, b) => a + b, 0) ?? 0;
  const totalObs = targetItem?.obs.reduce((a, b) => a + b, 0) ?? 0;
  const successRate = totalSamples && totalObs ? totalObs / totalSamples : null;

  const datasetVersion = targets?.citation.match(/EBD_rel([A-Za-z]+)-(\d{4})/);
  const datasetAsOf = datasetVersion ? `${datasetVersion[1]} ${datasetVersion[2]}` : null;

  const reduceLoaders = !!speciesCode;

  return (
    <>
      {speciesCode && (
        <div className="text-sm -mx-1 my-1 bg-primary/10 text-primary-hover py-2.5 px-3 rounded">
          {speciesName}
          <br />
          {isLoadingTargets && <Spinner className="size-5" />}
          {!isLoadingTargets && successRate !== null && (
            <>
              <strong className="text-xl">{Math.round(successRate * 100)}%</strong> of {totalSamples.toLocaleString()}{" "}
              checklists
              {datasetAsOf && (
                <span className="relative inline-block ml-1.5">
                  <button
                    type="button"
                    aria-label="About this stat"
                    className="block text-primary-hover leading-none"
                    onMouseEnter={() => setShowDatasetTip(true)}
                    onMouseLeave={() => setShowDatasetTip(false)}
                    onFocus={() => setShowDatasetTip(true)}
                    onBlur={() => setShowDatasetTip(false)}
                    onClick={() => setShowDatasetTip((s) => !s)}
                  >
                    <Icon name="questionMark" className="text-sm" />
                  </button>
                  {showDatasetTip && (
                    <span
                      role="tooltip"
                      className="absolute z-20 top-full left-1/2 -translate-x-1/2 mt-1.5 w-48 bg-gray-900 text-white text-xs font-normal leading-snug px-2.5 py-1.5 rounded shadow-lg text-left"
                    >
                      As of {datasetAsOf}. Recent reports may not be reflected.
                    </span>
                  )}
                </span>
              )}
            </>
          )}
          {!isLoadingTargets && successRate === null && (
            <span className="text-primary-hover/80">No frequency data available</span>
          )}
          {!!obsError && <span className="text-red-500">Failed to load recent reports</span>}
        </div>
      )}
      {speciesCode && (
        <SelectDropdown
          className="my-4"
          compact
          align="left"
          value={view}
          onChange={setView}
          options={[
            { value: "all", label: "All Checklists" },
            { value: "obs", label: `${speciesName} Reports` },
          ]}
        />
      )}
      {view === "obs" && speciesCode && <ObsList hotspotId={hotspotId} speciesCode={speciesCode} />}
      {view === "all" && (
        <>
          {checklists.length > 0 && (
            <table className="w-full text-[13px] mt-2">
              <thead className="text-neutral-600 font-bold">
                <tr>
                  <th className="text-left pl-1.5">Time ago</th>
                  {speciesCode && <th className="text-center">{speciesName}</th>}
                  {!speciesCode && <th className="text-center min-w-8">Species Count</th>}
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((checklists) => {
                  const checklist = checklists[0];
                  const { subId, numSpecies, obsDt, obsTime } = checklist;
                  const checklistIds = checklists.map((it) => it.subId);
                  const time = obsTime || "10:00";
                  const timestamp = dayjs(`${obsDt} ${time}`).format();
                  const hasObs = obs?.some((it) => checklistIds.includes(it.checklistId));
                  const obsLabel = !obs?.length ? "--" : hasObs ? "✅" : "❌";
                  const region =
                    checklist?.loc.subnational2Code ||
                    checklist?.loc.subnational1Code ||
                    checklist?.loc.countryCode ||
                    "";
                  return (
                    <tr key={subId} className="even:bg-neutral-50">
                      <td className="pl-1.5 py-[5px]">
                        <time dateTime={timestamp} title={`${obsDt} ${time}`}>
                          {dateTimeToRelative(`${obsDt} ${time}`, region)}
                        </time>
                      </td>
                      {speciesCode && <td className="text-center">{obsLabel}</td>}
                      {!speciesCode && <td className="text-center">{numSpecies || "—"}</td>}
                      <td className="text-right">
                        <a href={`https://ebird.org/checklist/${subId}`} target="_blank" rel="noreferrer">
                          View Checklist
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!expanded && mergedChecklists.length > 10 && (
            <Button variant="link" onClick={() => setExpanded(true)} className="block w-full text-sm text-center mt-2">
              View more
            </Button>
          )}
          {expanded && (
            <p className="text-sm mt-2 text-center">
              <Button
                variant="link"
                target="_blank"
                className="text-sm"
                href={`https://ebird.org/hotspot/${hotspotId}/activity?yr=all&m=`}
              >
                View more on eBird
              </Button>
            </p>
          )}
          {!isLoading && !isLoadingSpecies && checklists.length === 0 && !error && (
            <Alert variant="muted" className="-mx-1 my-1">
              No recent checklists
            </Alert>
          )}
          {(isLoading || isLoadingSpecies) && !reduceLoaders && (
            <div className="flex items-center justify-center my-8">
              <Spinner className="size-6" />
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="-mx-1 my-1">
              <Icon name="xMarkCircle" className="text-xl" />
              Failed to load recent checklists
              <Button variant="link" onClick={() => refetch()}>
                Retry
              </Button>
            </Alert>
          )}
        </>
      )}
    </>
  );
}

type RecentSpeciesRow = { checklistId: string; date: string };

function buildFallbackLoc(region: string): RecentChecklist["loc"] {
  const [countryCode = "", sub1 = "", sub2 = ""] = region.split("-");
  return {
    locId: "",
    name: "",
    latitude: 0,
    longitude: 0,
    countryCode,
    countryName: "",
    subnational1Name: "",
    subnational1Code: sub1 ? `${countryCode}-${sub1}` : "",
    subnational2Code: sub2 ? `${countryCode}-${sub1}-${sub2}` : "",
    subnational2Name: "",
    isHotspot: true,
    locName: "",
    lat: 0,
    lng: 0,
    hierarchicalName: "",
    locID: "",
  };
}

// eBird's /product/lists feed can lag by up to ~7 days for some hotspots, so we
// supplement it with subIds derived from /data/obs (already fetched for the
// Recent Needs tab). Only catches checklists where at least one species's most
// recent sighting at the hotspot is in that checklist.
function mergeSupplementalChecklists(
  groups: RecentChecklist[][],
  recentSpecies: RecentSpeciesRow[] | undefined,
  fallbackRegion?: string
): RecentChecklist[][] {
  if (!recentSpecies?.length) return groups;

  const knownSubIds = new Set<string>();
  const keyToGroup = new Map<string, RecentChecklist[]>();
  const merged = groups.map((group) => {
    const copy = [...group];
    group.forEach((c) => knownSubIds.add(c.subId));
    const head = group[0];
    keyToGroup.set(`${head.obsDt}-${head.obsTime || ""}`, copy);
    return copy;
  });

  // Reuse loc from any existing checklist (same hotspot). When /product/lists
  // returns nothing, fall back to a minimal loc derived from the trip region
  // so we still surface the supplemental rows (and dateTimeToRelative gets a
  // valid region code for timezone resolution).
  const refLoc = groups[0]?.[0]?.loc ?? (fallbackRegion ? buildFallbackLoc(fallbackRegion) : undefined);
  if (!refLoc) return merged;

  const seen = new Set<string>();
  for (const obs of recentSpecies) {
    const subId = obs.checklistId;
    if (!subId || knownSubIds.has(subId) || seen.has(subId)) continue;
    seen.add(subId);

    const parsed = dayjs(obs.date);
    if (!parsed.isValid()) continue;
    const obsDt = parsed.format("D MMM YYYY");
    const obsTime = parsed.format("HH:mm");
    const key = `${obsDt}-${obsTime}`;

    const supplemental: RecentChecklist = {
      locId: refLoc.locId,
      subId,
      subID: subId,
      userDisplayName: "",
      numSpecies: 0,
      isoObsDate: parsed.format("YYYY-MM-DDTHH:mm"),
      obsDt,
      obsTime,
      loc: refLoc,
    };

    const existing = keyToGroup.get(key);
    if (existing) {
      existing.push(supplemental);
    } else {
      const newGroup = [supplemental];
      keyToGroup.set(key, newGroup);
      merged.push(newGroup);
    }
  }

  return merged.sort((a, b) => {
    const aTs = dayjs(`${a[0].obsDt} ${a[0].obsTime || "00:00"}`).valueOf();
    const bTs = dayjs(`${b[0].obsDt} ${b[0].obsTime || "00:00"}`).valueOf();
    return bTs - aTs;
  });
}
