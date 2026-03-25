import React from "react";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import HotspotTargetRow from "components/HotspotTargetRow";
import FilterTabs from "components/FilterTabs";
import { useProfile } from "providers/profile";
import Alert from "components/Alert";
import { HOTSPOT_TARGET_CUTOFF } from "lib/config";
import useLocationTargets from "hooks/useLocationTargets";
import { computeFrequency, getMonthRange } from "lib/targets";

type Props = {
  hotspotId: string;
  onSpeciesClick: () => void;
  onAddToTrip: () => void;
};

export default function HotspotTargets({ hotspotId, onSpeciesClick, onAddToTrip }: Props) {
  const { lifelist } = useProfile();
  const [view, setView] = React.useState<string>("all");
  const { trip, setSelectedSpecies, dateRangeLabel } = useTrip();
  const { data, isLoading, isError, refetch } = useLocationTargets(hotspotId);

  const isSaved = !!trip?.hotspots.find((it) => it.id === hotspotId);

  const allMonths = getMonthRange(1, 12);
  const tripMonths = getMonthRange(trip?.startMonth || 1, trip?.endMonth || 12);

  const sortedItems = React.useMemo(() => {
    if (!data?.items?.length) return [];
    const months = view === "all" ? allMonths : tripMonths;
    return data.items
      .map((item) => ({
        code: item.code,
        name: item.name,
        frequency: computeFrequency(item.obs, data.samples, months),
      }))
      .filter((it) => !lifelist?.includes(it.code) && it.frequency >= HOTSPOT_TARGET_CUTOFF)
      .sort((a, b) => b.frequency - a.frequency);
  }, [data, view, lifelist, allMonths, tripMonths]);

  if (isLoading) {
    return (
      <Alert style="info" className="-mx-1 my-1">
        <Icon name="loading" className="text-xl animate-spin" />
        Loading targets...
      </Alert>
    );
  }

  if (isError) {
    return (
      <Alert style="error" className="-mx-1 my-1">
        <Icon name="xMarkCircle" className="text-xl" />
        Failed to load targets
        <button className="text-sky-600 font-medium" onClick={() => refetch()}>
          Retry
        </button>
      </Alert>
    );
  }

  return (
    <>
      {!!data?.items?.length && (
        <FilterTabs
          className="my-4"
          value={view}
          onChange={setView}
          options={[
            { label: "All Year", value: "all" },
            { label: dateRangeLabel, value: "obs" },
          ]}
        />
      )}
      {!sortedItems?.length && (
        <Alert style="info" className="-mx-1 my-1">
          No targets found &gt; {HOTSPOT_TARGET_CUTOFF}%
        </Alert>
      )}
      {sortedItems.map((it, index) => (
        <HotspotTargetRow
          key={it.code}
          code={it.code}
          name={it.name}
          frequency={it.frequency}
          index={index}
          hotspotId={hotspotId}
          range={view === "all" ? "All Year" : dateRangeLabel}
          isSaved={isSaved}
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
              ? `https://ebird.org/targets?r1=${hotspotId}&bmo=1&emo=12&r2=world&t2=life`
              : `https://ebird.org/targets?r1=${hotspotId}&bmo=${trip?.startMonth}&emo=${trip?.endMonth}&r2=world&t2=life`
          }
          target="_blank"
          rel="noreferrer"
          className="text-sky-600 text-[12px] font-bold pr-3 py-1"
        >
          View on eBird
        </a>
      </div>
    </>
  );
}
