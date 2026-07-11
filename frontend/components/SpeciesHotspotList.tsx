import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
import { Card } from "components/ui/card";
import EmptyState from "components/EmptyState";
import FrequencyBar from "components/FrequencyBar";
import SelectDropdown from "components/SelectDropdown";
import { formatFrequency } from "lib/helpers";
import type { OpenBirdingHotspotRanking } from "@birdplan/shared";

export type HotspotItem = OpenBirdingHotspotRanking & {
  saved: boolean;
  lastSeen?: string;
};

export type MonthMode = "trip" | "all";

type Props = {
  hotspots: HotspotItem[];
  onSelect: (id: string) => void;
  monthMode: MonthMode;
  setMonthMode: (m: MonthMode) => void;
  tripRangeLabel: string;
  loading?: boolean;
};

export default function SpeciesHotspotList({
  hotspots,
  onSelect,
  monthMode,
  setMonthMode,
  tripRangeLabel,
  loading,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="text-base font-bold text-gray-800">Top hotspots</div>
          {tripRangeLabel && (
            <SelectDropdown
              compact
              align="left"
              value={monthMode}
              onChange={setMonthMode}
              options={[
                { value: "all", label: "All Year" },
                { value: "trip", label: tripRangeLabel },
              ]}
            />
          )}
        </div>
        {loading ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
            <Spinner className="size-3.5" />
            <span className="hidden sm:inline">Updating…</span>
          </div>
        ) : (
          <div className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">
            Showing {hotspots.length} results
          </div>
        )}
      </div>
      <div className={clsx("transition-opacity duration-200", loading && "opacity-50")}>
        {hotspots.length === 0 ? (
          <EmptyState inline title="No hotspots match these filters." className="m-4" />
        ) : (
          hotspots.map((h, i) => <SpeciesHotspotRow key={h.id} h={h} rank={i + 1} onSelect={onSelect} />)
        )}
      </div>
    </Card>
  );
}

function SpeciesHotspotRow({ h, rank, onSelect }: { h: HotspotItem; rank: number; onSelect: (id: string) => void }) {
  const freqDisplay = formatFrequency(h.frequency);
  return (
    <div
      onClick={() => onSelect(h.id)}
      role="button"
      tabIndex={0}
      className="px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-primary/5 transition-colors cursor-pointer grid gap-4 items-center grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_220px_28px]"
    >
      <div className="text-gray-400 text-sm font-medium tabular-nums w-5 text-right hidden sm:block">{rank}.</div>
      <div className="min-w-0 sm:col-auto col-start-1 col-span-2">
        <div className="text-[15px] font-semibold text-gray-800 truncate">{h.name}</div>
        <div className="flex items-center gap-2.5 text-xs text-gray-600 mt-1.5">
          <LastSeen value={h.lastSeen} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 sm:col-auto col-start-1 col-span-2 sm:row-auto">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-bold text-gray-800 tabular-nums">{freqDisplay}%</span>
          <span className="text-[11px] text-gray-600 whitespace-nowrap">of {h.samples} checklists</span>
        </div>
        <FrequencyBar percent={h.frequency} />
      </div>

      <div
        className="row-start-1 row-span-2 sm:row-auto sm:row-span-1 col-start-3 sm:col-auto justify-self-end self-start sm:self-center w-7 pt-1 sm:pt-0 grid place-items-center"
        title={h.saved ? "Saved hotspot" : undefined}
        aria-label={h.saved ? "Saved hotspot" : undefined}
      >
        {h.saved && <Icon name="star" className="text-star text-base" />}
      </div>
    </div>
  );
}

function LastSeen({ value }: { value?: string }) {
  if (!value) return <span className="text-gray-500">—</span>;
  const lower = value.toLowerCase();
  const isRecent = lower === "today" || lower === "yesterday";
  const isOld = value.includes("> 30");
  const dot = isRecent ? "bg-success" : "bg-warning";
  const text = isRecent ? "text-success" : isOld ? "text-gray-500" : "text-gray-700";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap", text)}>
      {!isOld && <span className={clsx("w-1.5 h-1.5 rounded-full", dot)} />}
      {value}
    </span>
  );
}
