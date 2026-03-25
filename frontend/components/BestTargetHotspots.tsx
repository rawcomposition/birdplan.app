import React from "react";
import Alert from "components/Alert";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import FilterTabs from "components/FilterTabs";
import { OPENBIRDING_API_URL, HOTSPOT_TARGET_CUTOFF } from "lib/config";
import { getMonthRange } from "lib/targets";
import { useQuery } from "@tanstack/react-query";
import type { OpenBirdingHotspotRankingResponse } from "@birdplan/shared";

type Props = {
  speciesCode: string;
  speciesName: string;
  className?: string;
};

export default function BestTargetHotspots({ speciesCode, speciesName, className }: Props) {
  const [filter, setFilter] = React.useState("year");
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { trip, dateRangeLabel } = useTrip();
  const { open } = useModal();

  const locationIds = trip?.hotspots?.map((it) => it.id) || [];
  const hasHotspots = !!trip?.hotspots?.length;

  const months = filter === "year" ? undefined : getMonthRange(trip?.startMonth || 1, trip?.endMonth || 12);

  const { data, isLoading, isError } = useQuery<OpenBirdingHotspotRankingResponse>({
    queryKey: ["openbirding-best-hotspots", speciesCode, locationIds, months],
    queryFn: async () => {
      const body: Record<string, any> = { locationIds };
      if (months) body.months = months;
      const res = await fetch(`${OPENBIRDING_API_URL}/api/v1/hotspots/species/${speciesCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to fetch hotspot rankings");
      return res.json();
    },
    enabled: hasHotspots && !!OPENBIRDING_API_URL,
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  if (!hasHotspots) return <Alert style="warning">You have not saved any hotspots for this trip</Alert>;
  if (isLoading) return <div className="text-gray-500 text-sm py-2">Loading hotspot rankings...</div>;
  if (isError) return <Alert style="error">Failed to load hotspot rankings</Alert>;

  const topHotspots =
    data?.items?.filter((it) => it.frequency >= HOTSPOT_TARGET_CUTOFF).sort((a, b) => b.frequency - a.frequency) || [];

  const slicedHotspots = isExpanded ? topHotspots : topHotspots.slice(0, 5);
  if (!slicedHotspots?.length) return <Alert style="warning">No hotspots found for {speciesName}</Alert>;
  const howManyMore = Math.max(0, topHotspots.length - slicedHotspots.length);

  return (
    <div className={className || ""}>
      <div className="flex items-center gap-2">
        <h4 className="text-gray-700 font-bold text-[15px]">Best Saved Hotspots</h4>
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
        {slicedHotspots.map((item, index) => {
          const hotspot = trip?.hotspots?.find((it) => it.id === item.id);
          return (
            <div
              key={item.id}
              className="border-t border-gray-100 py-1.5 text-gray-500/80 text-[13px] grid gap-2 grid-cols-1 sm:grid-cols-5 mx-1 cursor-pointer group"
              onClick={() => open("hotspot", { hotspot: hotspot || item })}
              title="Click to view hotspot"
              role="button"
              tabIndex={0}
            >
              <div className="sm:col-span-3 pt-2">
                <span className="sm:mr-2 mr-2">{index + 1}.</span>
                <span className="text-left sm:group-hover:underline text-gray-900 text-sm sm:ml-3">
                  {hotspot?.name || item.name}
                </span>
              </div>
              <div className="flex gap-5 sm:col-span-2">
                <div className="flex flex-col gap-1 w-full col-span-2">
                  <div>
                    <span className="text-gray-600 text-[15px] font-bold">
                      {item.frequency > 1 ? Math.round(item.frequency) : item.frequency}%
                    </span>{" "}
                    <span className="text-gray-500 text-[12px]">of {item.samples} checklists</span>
                  </div>
                  <div className="w-full bg-gray-200">
                    <div className="h-2 bg-[#1c6900]" style={{ width: `${item.frequency}%` }} />
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
