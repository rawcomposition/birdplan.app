import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";
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
};

export default function SpeciesHotspotList({ hotspots, onSelect, monthMode, setMonthMode, tripRangeLabel }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="text-base font-bold text-gray-800">Top hotspots</div>
          {tripRangeLabel && (
            <MonthRangeDropdown mode={monthMode} onChange={setMonthMode} tripRangeLabel={tripRangeLabel} />
          )}
        </div>
        <div className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">Showing {hotspots.length} results</div>
      </div>
      {hotspots.length === 0 ? (
        <div className="px-6 py-16 text-center text-gray-500 text-sm">No hotspots match these filters.</div>
      ) : (
        hotspots.map((h, i) => <SpeciesHotspotRow key={h.id} h={h} rank={i + 1} onSelect={onSelect} />)
      )}
    </div>
  );
}

function MonthRangeDropdown({
  mode,
  onChange,
  tripRangeLabel,
}: {
  mode: MonthMode;
  onChange: (m: MonthMode) => void;
  tripRangeLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  const options: { value: MonthMode; label: string }[] = [
    { value: "all", label: "All Year" },
    { value: "trip", label: tripRangeLabel },
  ];
  const current = options.find((o) => o.value === mode) ?? options[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
      >
        {current.label}
        <Icon name="angleDown" className="text-[9px] text-gray-500" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute top-full left-0 mt-1.5 z-40 min-w-[160px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {options.map((o) => {
              const active = o.value === mode;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between",
                    active ? "bg-sky-50 text-sky-700" : "text-gray-800 hover:bg-gray-50"
                  )}
                >
                  <span>{o.label}</span>
                  {active && <Icon name="check" className="text-xs" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SpeciesHotspotRow({ h, rank, onSelect }: { h: HotspotItem; rank: number; onSelect: (id: string) => void }) {
  const freqDisplay = h.frequency > 1 ? Math.round(h.frequency) : h.frequency;
  return (
    <div
      onClick={() => onSelect(h.id)}
      role="button"
      tabIndex={0}
      className="px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-sky-50/60 transition-colors cursor-pointer grid gap-4 items-center grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_220px_28px]"
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
        <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-green-600 rounded-full" style={{ width: `${Math.min(100, h.frequency)}%` }} />
        </div>
      </div>

      <div
        className="row-start-1 row-span-2 sm:row-auto sm:row-span-1 col-start-3 sm:col-auto justify-self-end self-start sm:self-center w-7 pt-1 sm:pt-0 grid place-items-center"
        title={h.saved ? "Saved hotspot" : undefined}
        aria-label={h.saved ? "Saved hotspot" : undefined}
      >
        {h.saved && <Icon name="star" className="text-yellow-500 text-base" />}
      </div>
    </div>
  );
}

function LastSeen({ value }: { value?: string }) {
  if (!value) return <span className="text-gray-500">—</span>;
  const lower = value.toLowerCase();
  const isRecent = lower === "today" || lower === "yesterday";
  const isOld = value.includes("> 30");
  const dot = isRecent ? "bg-green-600" : "bg-yellow-500";
  const text = isRecent ? "text-green-700" : isOld ? "text-gray-500" : "text-gray-700";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap", text)}>
      {!isOld && <span className={clsx("w-1.5 h-1.5 rounded-full", dot)} />}
      {value}
    </span>
  );
}
