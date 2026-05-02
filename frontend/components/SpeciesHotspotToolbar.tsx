import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";

export type Scope = "saved" | "all";
export type SortKey = "freq" | "dist" | "lastSeen" | "checklists";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "freq", label: "Frequency" },
  { value: "dist", label: "Distance" },
  { value: "lastSeen", label: "Last seen" },
  { value: "checklists", label: "Checklist volume" },
];

type Props = {
  scope: Scope;
  setScope: (s: Scope) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  minChecklists: number;
  setMinChecklists: (n: number) => void;
};

export default function SpeciesHotspotToolbar({
  scope,
  setScope,
  sort,
  setSort,
  minChecklists,
  setMinChecklists,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <ScopeToggle scope={scope} setScope={setScope} />
      <div className="ml-auto flex items-center gap-2.5 flex-wrap">
        <SortDropdown value={sort} onChange={setSort} />
        <MoreFiltersMenu minChecklists={minChecklists} setMinChecklists={setMinChecklists} />
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
  minChecklists,
  setMinChecklists,
}: {
  minChecklists: number;
  setMinChecklists: (n: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const activeCount = minChecklists > 0 ? 1 : 0;

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
            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              Minimum checklists
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs text-gray-700">
              <span>Min</span>
              <button
                type="button"
                onClick={() => setMinChecklists(Math.max(0, minChecklists - 5))}
                className="w-6 h-6 rounded grid place-items-center text-gray-600 hover:bg-gray-100"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[22px] text-center font-bold text-gray-800">{minChecklists}</span>
              <button
                type="button"
                onClick={() => setMinChecklists(minChecklists + 5)}
                className="w-6 h-6 rounded grid place-items-center text-gray-600 hover:bg-gray-100"
                aria-label="Increase"
              >
                +
              </button>
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              Hide hotspots with fewer than {minChecklists || 0} checklists (low confidence).
            </div>
          </div>
        </>
      )}
    </div>
  );
}
