import React from "react";
import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import HotspotTargetRow from "components/HotspotTargetRow";
import FilterTabs from "components/FilterTabs";
import { useProfile } from "providers/profile";
import { useHotspotTargets } from "providers/hotspot-targets";
import Alert from "components/Alert";
import { HOTSPOT_TARGET_CUTOFF } from "lib/config";
import { useQueryClient } from "@tanstack/react-query";
import useMutation from "hooks/useMutation";

type Props = {
  hotspotId: string;
  onSpeciesClick: () => void;
};

export default function HotspotTargets({ hotspotId, onSpeciesClick }: Props) {
  const { lifelist } = useProfile();
  const queryClient = useQueryClient();
  const [view, setView] = React.useState<string>("all");
  const { trip, setSelectedSpecies, dateRangeLabel } = useTrip();
  const { pendingLocIds, failedLocIds, allTargets, retryDownload } = useHotspotTargets();
  const [isPending, setIsPending] = React.useState(false);

  const isDownloading = pendingLocIds.includes(hotspotId);
  const isFailed = failedLocIds.includes(hotspotId);

  const items = allTargets.find((it) => it.hotspotId === hotspotId)?.items;

  const sortedItems = (() => {
    if (!items?.length) return [];
    const needs = items.filter((it) => !lifelist?.includes(it.code));
    const filtered = view === "all" ? needs.filter((it) => it.percentYr >= 5) : needs.filter((it) => it.percent >= 5);
    return view === "all"
      ? filtered.sort((a, b) => b.percentYr - a.percentYr)
      : filtered.sort((a, b) => b.percent - a.percent);
  })();

  const hasResults = !!items?.length;

  const resetTargetsMutation = useMutation({
    url: `/api/trips/${trip?._id}/hotspots/${hotspotId}/reset-targets`,
    method: "PATCH",
    onMutate: () => setIsPending(true),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}/all-hotspot-targets`] });
      setIsPending(false);
    },
    onError: () => {
      setIsPending(false);
    },
  });

  if (isDownloading) {
    return (
      <Alert style="info" className="-mx-1 my-1">
        <Icon name="loading" className="text-xl animate-spin" />
        Downloading targets from eBird...
      </Alert>
    );
  }

  if (isFailed) {
    return (
      <Alert style="error" className="-mx-1 my-1">
        <Icon name="xMarkCircle" className="text-xl" />
        Failed to download targets from eBird
        <button className="text-sky-600 font-medium" onClick={() => retryDownload(hotspotId)}>
          Retry
        </button>
      </Alert>
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
            { label: dateRangeLabel, value: "obs" },
          ]}
        />
      )}
      {!sortedItems?.length && <p className="text-gray-500 text-sm">No targets found &gt; {HOTSPOT_TARGET_CUTOFF}%</p>}
      {sortedItems.map((it, index) => (
        <HotspotTargetRow
          key={it.code}
          {...it}
          index={index}
          view={view}
          hotspotId={hotspotId}
          range={dateRangeLabel}
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
        <button
          type="button"
          className="text-sky-600 text-[12px] font-bold pl-3 py-1 inline-flex items-center gap-1"
          onClick={() => resetTargetsMutation.mutate({})}
          disabled={isPending}
        >
          <Icon name="refresh" />
          {isPending ? "Refreshing..." : "Refresh Targets"}
        </button>
      </div>
    </>
  );
}
