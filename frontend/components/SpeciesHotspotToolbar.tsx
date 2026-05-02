import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";

export type Scope = "saved" | "all";
export type SortKey = "best" | "freq";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "best", label: "Best" },
  { value: "freq", label: "Frequency" },
];

const MIN_OBS_STEPS = [1, 2, 5, 10, 25, 50, 100, 200, 300, 400];

function nextStep(n: number): number {
  const found = MIN_OBS_STEPS.find((s) => s > n);
  return found ?? n + 100;
}

function prevStep(n: number): number {
  const below = MIN_OBS_STEPS.filter((s) => s < n);
  if (below.length > 0) return below[below.length - 1];
  return Math.max(1, n - 100);
}

type Props = {
  scope: Scope;
  setScope: (s: Scope) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  minObservations: number;
  setMinObservations: (n: number) => void;
  recentDays: number | null;
  setRecentDays: (n: number | null) => void;
};

export default function SpeciesHotspotToolbar({
  scope,
  setScope,
  sort,
  setSort,
  minObservations,
  setMinObservations,
  recentDays,
  setRecentDays,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <ScopeToggle scope={scope} setScope={setScope} />
      <div className="ml-auto flex items-center gap-2.5 flex-wrap">
        <SortDropdown value={sort} onChange={setSort} />
        <MoreFiltersMenu
          minObservations={minObservations}
          setMinObservations={setMinObservations}
          recentDays={recentDays}
          setRecentDays={setRecentDays}
        />
      </div>
    </div>
  );
}

function ScopeToggle({ scope, setScope }: { scope: Scope; setScope: (s: Scope) => void }) {
  const options: { value: Scope; label: string; icon?: React.ReactNode }[] = [
    { value: "saved", label: "Saved", icon: <Icon name="star" className="text-xs" /> },
    { value: "all", label: "All hotspots" },
  ];
  return (
    <div className="inline-flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
      {options.map((opt) => {
        const active = scope === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setScope(opt.value)}
            className={clsx(
              "px-3 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1.5 whitespace-nowrap",
              active ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = React.useState(false);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
      >
        <span className="text-gray-500">Sort</span>
        <span className="font-semibold text-gray-800">{current.label}</span>
        <Icon name="angleDown" className="text-[10px] text-gray-500" />
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute top-full right-0 mt-1.5 z-40 min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {SORT_OPTIONS.map((o) => {
              const active = o.value === value;
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

function MoreFiltersMenu({
  minObservations,
  setMinObservations,
  recentDays,
  setRecentDays,
}: {
  minObservations: number;
  setMinObservations: (n: number) => void;
  recentDays: number | null;
  setRecentDays: (n: number | null) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const activeCount = (minObservations > 1 ? 1 : 0) + (recentDays != null ? 1 : 0);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-sm whitespace-nowrap",
          activeCount > 0
            ? "border-sky-300 bg-sky-50 text-sky-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        )}
      >
        Filters
        {activeCount > 0 && (
          <span className="bg-sky-600 text-white rounded-full px-1.5 text-[10px] font-bold min-w-[16px] text-center">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute top-full right-0 mt-2 z-40 w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                Last seen (days)
              </div>
              <button
                type="button"
                onClick={() => {
                  setMinObservations(1);
                  setRecentDays(null);
                  setOpen(false);
                }}
                className={clsx(
                  "text-[11px] font-semibold text-sky-600 hover:text-sky-700",
                  activeCount === 0 && "invisible"
                )}
              >
                Clear all
              </button>
            </div>
            <div className="inline-flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 mb-4">
              {([
                { value: null, label: "Any" },
                { value: 3, label: "3" },
                { value: 7, label: "7" },
                { value: 14, label: "14" },
                { value: 30, label: "30" },
              ] as const).map((opt) => {
                const active = recentDays === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setRecentDays(opt.value)}
                    className={clsx(
                      "px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap",
                      active ? "bg-white text-gray-800 shadow-sm" : "text-gray-600 hover:text-gray-800"
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              Minimum observations
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-700">
              <span>Min</span>
              <button
                type="button"
                onClick={() => setMinObservations(prevStep(minObservations))}
                className="w-6 h-6 rounded grid place-items-center text-gray-600 hover:bg-gray-100"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[22px] text-center font-bold text-gray-800">{minObservations}</span>
              <button
                type="button"
                onClick={() => setMinObservations(nextStep(minObservations))}
                className="w-6 h-6 rounded grid place-items-center text-gray-600 hover:bg-gray-100"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
