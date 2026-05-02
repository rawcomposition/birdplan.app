import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";

export type HotspotItem = {
  id: string;
  name: string;
  region?: string;
  frequency: number;
  samples: number;
  score?: number;
  saved: boolean;
  distanceKm?: number;
  lastSeen?: string;
  lastSeenAt?: string; // ISO date used for sorting
};

type Props = {
  hotspots: HotspotItem[];
  total: number;
  onSelect: (id: string) => void;
};

export default function SpeciesHotspotList({ hotspots, total, onSelect }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-200 flex items-baseline justify-between">
        <div className="text-base font-bold text-gray-800">Top hotspots</div>
        <div className="text-xs text-gray-500">
          {hotspots.length} of {total}
        </div>
      </div>
      {hotspots.length === 0 ? (
        <div className="px-6 py-16 text-center text-gray-500 text-sm">No hotspots match these filters.</div>
      ) : (
        hotspots.map((h, i) => <SpeciesHotspotRow key={h.id} h={h} rank={i + 1} onSelect={onSelect} />)
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
          {h.distanceKm != null && (
            <>
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Icon name="genericMarker" className="text-[10px] text-gray-500" />
                {h.distanceKm.toFixed(1)} km
              </span>
              <span className="w-[3px] h-[3px] rounded-full bg-gray-400" />
            </>
          )}
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
        className="row-start-1 sm:row-auto justify-self-end w-7 grid place-items-center"
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
  const dot = isRecent ? "bg-green-600" : isOld ? "bg-gray-300" : "bg-yellow-500";
  const text = isRecent ? "text-green-700" : isOld ? "text-gray-500" : "text-gray-700";
  return (
    <span className={clsx("inline-flex items-center gap-1.5 whitespace-nowrap", text)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", dot)} />
      {value}
    </span>
  );
}
