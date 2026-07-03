import React from "react";
import { cn } from "lib/utils";
import Icon from "components/Icon";
import SelectDropdown from "components/SelectDropdown";
import SegmentedControl from "components/SegmentedControl";
import FilterChip from "components/FilterChip";

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
      <SegmentedControl
        value={scope}
        onChange={setScope}
        options={[
          { value: "saved", label: "Saved", icon: <Icon name="star" className="text-xs" /> },
          { value: "all", label: "All hotspots" },
        ]}
      />
      <div className="sm:ml-auto flex items-center gap-2.5 flex-wrap">
        <SelectDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} label="Sort" />
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
      <FilterChip active={activeCount > 0} className="h-9 px-3 text-sm font-normal" onClick={() => setOpen((o) => !o)}>
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </FilterChip>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute top-full right-0 mt-2 z-40 w-[300px] bg-card border rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                Last seen (days)
              </div>
              <button
                type="button"
                onClick={() => {
                  setMinObservations(1);
                  setRecentDays(null);
                  setOpen(false);
                }}
                className={cn("text-[11px] font-semibold text-link hover:opacity-80", activeCount === 0 && "invisible")}
              >
                Clear all
              </button>
            </div>
            <SegmentedControl
              className="mb-4 h-8"
              value={recentDays}
              onChange={setRecentDays}
              options={[
                { value: null, label: "Any" },
                { value: 3, label: "3" },
                { value: 7, label: "7" },
                { value: 14, label: "14" },
                { value: 30, label: "30" },
              ]}
            />
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
              Minimum observations
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs text-secondary-foreground">
              <span>Min</span>
              <button
                type="button"
                onClick={() => setMinObservations(prevStep(minObservations))}
                className="w-6 h-6 rounded grid place-items-center text-secondary-foreground hover:bg-muted"
                aria-label="Decrease"
              >
                −
              </button>
              <span className="min-w-[22px] text-center font-bold text-foreground">{minObservations}</span>
              <button
                type="button"
                onClick={() => setMinObservations(nextStep(minObservations))}
                className="w-6 h-6 rounded grid place-items-center text-secondary-foreground hover:bg-muted"
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
