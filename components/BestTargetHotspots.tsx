import React from "react";
import Alert from "components/Alert";
import { useHotspotTargets } from "providers/hotspot-targets";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import FilterTabs from "components/FilterTabs";
import { HOTSPOT_TARGET_CUTOFF } from "lib/config";
import { LocationType } from "lib/types";

type Props = {
  speciesCode: string;
  speciesName: string;
  className?: string;
};

export default function BestTargetHotspots({ speciesCode, speciesName, className }: Props) {
  const [filter, setFilter] = React.useState("year");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { trip, locations, dateRangeLabel } = useTrip();
  const { allTargets } = useHotspotTargets();
  const { open } = useModal();

  const locationIds = locations.filter((it) => it.type === LocationType.hotspot).map((it) => it._id) || [];
  const hasHotspots = !!locationIds.length;

  if (!hasHotspots) return <Alert style="warning">You have not saved any hotspots for this trip</Alert>;
  if (!allTargets?.length)
    return (
      <Alert style="warning">
        Uh oh, for some reason your saved hotspots do not have any target data downloaded. You should probably contact
        the developer.
      </Alert>
    );

  const topHotspots = allTargets
    .filter(
      ({ items, hotspotId }) =>
        !!hotspotId &&
        locationIds.includes(hotspotId) &&
        items.find(
          (item) =>
            item.code === speciesCode &&
            (filter === "year" ? item.percentYr >= HOTSPOT_TARGET_CUTOFF : item.percent >= HOTSPOT_TARGET_CUTOFF)
        )
    )
    .map(({ items, hotspotId, N, yrN }) => {
      const hotspot = locations.find((it) => it._id === hotspotId);
      const targetInfo = items.find((item) => item.code === speciesCode);
      return {
        locationId: hotspotId,
        N,
        yrN,
        percent: targetInfo?.percent || 0,
        percentYr: targetInfo?.percentYr || 0,
        hotspot,
      };
    })
    .sort((a, b) => (filter === "year" ? b.percentYr - a.percentYr : b.percent - a.percent));

  const slicedHotspots = isExpanded ? topHotspots : topHotspots.slice(0, 5);
  if (!slicedHotspots?.length) return <Alert style="warning">No hotspots found for {speciesName}</Alert>;
  const howManyMore = Math.max(0, topHotspots.length - slicedHotspots.length);

  return (
    <div className={className || ""}>
      <div className="flex items-center gap-2">
        <h4 className="text-gray-700 font-bold text-[15px]">Best Hotspots</h4>
        <FilterTabs
          className="my-4"
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All Year", value: "year" },
            { label: dateRangeLabel, value: "range" },
          ]}
        />
      </div>
      <div className="flex flex-col gap-2">
        {slicedHotspots.map(({ hotspot, locationId, N, yrN, percent, percentYr }, index) => {
          const actualPercent = filter === "year" ? percentYr : percent;
          return (
            <div
              key={locationId}
              className="border-t border-gray-100 py-1.5 text-gray-500/80 text-[13px] grid gap-2 grid-cols-1 sm:grid-cols-5 mx-1 cursor-pointer group"
              onClick={() => open("hotspot", { hotspot })}
              title="Click to view hotspot"
              role="button"
              tabIndex={0}
            >
              <div className="sm:col-span-3 pt-2">
                <span className="sm:mr-2 mr-2">{index + 1}.</span>
                <span className="text-left sm:group-hover:underline text-gray-900 text-sm sm:ml-3">
                  {hotspot?.name || "Unknown Hotspot"}
                </span>
              </div>
              <div className="flex gap-5 sm:col-span-2">
                <div className="flex flex-col gap-1 w-full col-span-2">
                  <div>
                    <span className="text-gray-600 text-[15px] font-bold">
                      {actualPercent > 1 ? Math.round(actualPercent) : actualPercent}%
                    </span>{" "}
                    <span className="text-gray-500 text-[12px]">of {filter === "year" ? yrN : N} checklists</span>
                  </div>
                  <div className="w-full bg-gray-200">
                    <div className="h-2 bg-[#1c6900]" style={{ width: `${actualPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {howManyMore > 0 && (
        <button onClick={() => setIsExpanded(true)} className="text-sky-600 font-bold text-sm mt-2">
          View {howManyMore} more
        </button>
      )}
      {isExpanded && (
        <button onClick={() => setIsExpanded(false)} className="text-sky-600 font-bold text-sm mt-2">
          View less
        </button>
      )}
    </div>
  );
}
