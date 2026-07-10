import React from "react";
import { useTrip } from "hooks/useTrip";
import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
import { Button } from "components/ui/button";
import HotspotTargetRow from "components/HotspotTargetRow";
import SelectDropdown from "components/SelectDropdown";
import useTargetView from "hooks/useTargetView";
import useMutualTargets from "hooks/useMutualTargets";
import TargetViewToggle from "components/TargetViewToggle";
import { Alert } from "components/ui/alert";
import { HOTSPOT_TARGET_CUTOFF } from "lib/config";
import useLocationTargets from "hooks/useLocationTargets";
import { computeFrequency, getMonthRange } from "lib/targets";

type Props = {
  hotspotId: string;
  onSpeciesClick: (species: { code: string; name: string }) => void;
  onAddToTrip: () => void;
};

export default function HotspotTargets({ hotspotId, onSpeciesClick }: Props) {
  const [view, setView] = React.useState<string>("all");
  const { trip, dateRangeLabel } = useTrip();
  const { lifelist } = useTargetView(trip);
  const { isMutual } = useMutualTargets(trip);
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
      <div className="flex items-center justify-center my-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="-mx-1 my-1">
        <Icon name="xMarkCircle" className="text-xl" />
        Failed to load targets
        <Button variant="link" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <>
      {!!data?.items?.length && (
        <div className="my-4 flex items-center gap-2">
          <SelectDropdown
            compact
            align="left"
            value={view}
            onChange={setView}
            options={[
              { value: "all", label: "All Year" },
              { value: "obs", label: dateRangeLabel },
            ]}
          />
          <TargetViewToggle trip={trip} compact align="left" />
        </div>
      )}
      {!sortedItems?.length && (
        <Alert variant="muted" className="-mx-1 my-1">
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
          isMutual={isMutual(it.code)}
          onClick={() => {
            onSpeciesClick({ code: it.code, name: it.name });
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
          className="text-link text-[12px] font-bold pr-3 py-1"
        >
          View on eBird
        </a>
      </div>
    </>
  );
}
