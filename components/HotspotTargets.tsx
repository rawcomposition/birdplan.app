import React from "react";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import useHotspotTargets from "hooks/useHotspotTargets";
import HotspotTargetRow from "components/HotspotTargetRow";
import FilterTabs from "components/FilterTabs";
import { useProfile } from "providers/profile";
import useDownloadTargets from "hooks/useDownloadTargets";

type Props = {
  locId: string;
  tripRangeLabel: string;
  onSpeciesClick: () => void;
};

export default function HotspotTargets({ locId, tripRangeLabel, onSpeciesClick }: Props) {
  const { lifelist } = useProfile();
  const [view, setView] = React.useState<string>("all");
  const { trip, setSelectedSpecies } = useTrip();
  const tripId = trip?.id;
  const hotspot = trip?.hotspots.find((it) => it.id === locId);
  const hasTargets = !!hotspot?.targetsId;
  const needsTargets = !!hotspot && !hasTargets;
  const { addTargets, items, isLoading } = useHotspotTargets(locId);

  const { data, isFetching, isRefetching, error, refetch } = useDownloadTargets({
    region: locId,
    startMonth: trip?.startMonth,
    endMonth: trip?.endMonth,
    enabled: needsTargets,
    cutoff: "5%",
  });

  React.useEffect(() => {
    if (data && !!data.items?.length && tripId) {
      addTargets({ ...data, tripId, hotspotId: locId });
    }
  }, [data, tripId]);

  const sortedItems = React.useMemo(() => {
    if (!items?.length) return [];
    const needs = items.filter((it) => !lifelist?.includes(it.code));
    const filtered = view === "all" ? needs.filter((it) => it.percentYr >= 5) : needs.filter((it) => it.percent >= 5);
    return view === "all"
      ? filtered.sort((a, b) => b.percentYr - a.percentYr)
      : filtered.sort((a, b) => b.percent - a.percent);
  }, [items, view, lifelist]);

  const hasResults = !!items?.length;

  if (isFetching || isRefetching) {
    return (
      <div className="text-sm -mx-1 my-1 bg-sky-100 text-sky-800 py-2.5 px-3 rounded flex items-center gap-2">
        <Icon name="loading" className="text-xl animate-spin" />
        Downloading targets from eBird...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm -mx-1 my-1 bg-red-100 text-red-800 py-2.5 px-3 rounded gap-2 flex items-center">
        <Icon name="xMarkCircle" className="text-xl" />
        Failed to download targets from eBird
        <button className="text-sky-600 font-medium" onClick={() => refetch()}>
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
      {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
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
      {!isLoading && (
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
            onClick={() => refetch()}
          >
            <Icon name="refresh" />
            Refresh Targets
          </button>
        </div>
      )}
    </>
  );
}
