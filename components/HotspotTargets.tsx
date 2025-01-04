import React from "react";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import HotspotTargetRow from "components/HotspotTargetRow";
import FilterTabs from "components/FilterTabs";
import { useProfile } from "providers/profile";
import { useHotspotTargets } from "providers/hotspot-targets";

type Props = {
  locId: string;
  tripRangeLabel: string;
  onSpeciesClick: () => void;
};

export default function HotspotTargets({ locId, tripRangeLabel, onSpeciesClick }: Props) {
  const { lifelist } = useProfile();
  const [view, setView] = React.useState<string>("all");
  const { trip, setSelectedSpecies } = useTrip();
  const { pendingLocIds, failedLocIds, allTargets, resetHotspotTargets, retryDownload } = useHotspotTargets();

  const isDownloading = pendingLocIds.includes(locId);
  const isFailed = failedLocIds.includes(locId);

  const items = allTargets.find((it) => it.hotspotId === locId)?.items;

  const sortedItems = (() => {
    if (!items?.length) return [];
    const needs = items.filter((it) => !lifelist?.includes(it.code));
    const filtered = view === "all" ? needs.filter((it) => it.percentYr >= 5) : needs.filter((it) => it.percent >= 5);
    return view === "all"
      ? filtered.sort((a, b) => b.percentYr - a.percentYr)
      : filtered.sort((a, b) => b.percent - a.percent);
  })();

  const hasResults = !!items?.length;

  if (isDownloading) {
    return (
      <div className="text-sm -mx-1 my-1 bg-sky-100 text-sky-800 py-2.5 px-3 rounded flex items-center gap-2">
        <Icon name="loading" className="text-xl animate-spin" />
        Downloading targets from eBird...
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="text-sm -mx-1 my-1 bg-red-100 text-red-800 py-2.5 px-3 rounded gap-2 flex items-center">
        <Icon name="xMarkCircle" className="text-xl" />
        Failed to download targets from eBird
        <button className="text-sky-600 font-medium" onClick={() => retryDownload(locId)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {hasResults && (
        <FilterTabs
          className="my-4"
          value={view}
          onChange={setView}
          options={[
            { label: "All Year", value: "all" },
            { label: tripRangeLabel, value: "obs" },
          ]}
        />
      )}
      {!sortedItems?.length && <p className="text-gray-500 text-sm">No targets found &gt; 5%</p>}
      {sortedItems.map((it, index) => (
        <HotspotTargetRow
          key={it.code}
          {...it}
          index={index}
          view={view}
          locId={locId}
          range={tripRangeLabel}
          onClick={() => {
            setSelectedSpecies({ code: it.code, name: it.name });
            onSpeciesClick();
          }}
        />
      ))}
      <div className="flex items-center justify-between mt-2">
        <a
          href={
            view === "all"
              ? `https://ebird.org/targets?r1=${locId}&bmo=1&emo=12&r2=world&t2=life`
              : `https://ebird.org/targets?r1=${locId}&bmo=${trip?.startMonth}&emo=${trip?.endMonth}&r2=world&t2=life`
          }
          target="_blank"
          rel="noreferrer"
          className="text-sky-600 text-[12px] font-bold pr-3 py-1"
        >
          View on eBird
        </a>
        <button
          type="button"
          className="text-sky-600 text-[12px] font-bold pl-3 py-1 inline-flex items-center gap-1"
          onClick={() => resetHotspotTargets(locId)}
        >
          <Icon name="refresh" />
          Refresh Targets
        </button>
      </div>
    </>
  );
}
