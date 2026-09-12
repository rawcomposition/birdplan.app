import React from "react";
import { cn } from "lib/utils";
import Icon from "components/Icon";
import MapButton from "components/MapButton";
import MinStepper from "components/MinStepper";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { DEFAULT_HOTSPOT_FILTERS, HotspotFilters } from "stores/hotspotFilterPreferences";
import { TripLabel } from "@birdplan/shared";
import LabelBadge from "components/LabelBadge";
import LabelPickerItems from "components/LabelPickerItems";
import { ChevronDown, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "components/ui/dropdown-menu";

const MIN_CHECKLIST_STEPS = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000];
const MIN_SPECIES_STEPS = [0, 25, 50, 100, 150, 200, 250, 300, 400];

type LabelFieldProps = {
  title: string;
  placeholder: string;
  labels: TripLabel[];
  selectedIds: string[];
  disabledIds: string[];
  exclude?: boolean;
  onChange: (ids: string[]) => void;
};

function LabelField({ title, placeholder, labels, selectedIds, disabledIds, exclude, onChange }: LabelFieldProps) {
  const selectedLabels = labels.filter((it) => selectedIds.includes(it._id));
  const toggle = (labelId: string, checked: boolean) =>
    onChange(checked ? [...selectedIds, labelId] : selectedIds.filter((id) => id !== labelId));

  return (
    <div className="mb-4">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">{title}</div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex w-full min-h-9 items-center gap-1.5 flex-wrap rounded-lg border bg-card px-2.5 py-1.5 text-left text-sm hover:bg-muted/50"
            />
          }
        >
          {selectedLabels.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedLabels.map((label) =>
              exclude ? (
                <LabelBadge key={label._id} label={label} className="line-through opacity-70 gap-1">
                  <Ban className="size-3 shrink-0" />
                </LabelBadge>
              ) : (
                <LabelBadge key={label._id} label={label} />
              )
            )
          )}
          <ChevronDown className="size-4 ml-auto text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[268px]">
          <LabelPickerItems labels={labels} selectedIds={selectedIds} disabledIds={disabledIds} onToggle={toggle} />
          {selectedIds.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onChange([])}>Clear</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type Props = {
  showAllHotspots: boolean;
  setShowAllHotspots: (show: boolean) => void;
  hotspotFilters: HotspotFilters;
  labels: TripLabel[];
  setHotspotFilters: (filters: Partial<HotspotFilters>) => void;
  popoverClassName?: string;
};

export default function HotspotFilterMenu({
  showAllHotspots,
  setShowAllHotspots,
  hotspotFilters,
  labels,
  setHotspotFilters,
  popoverClassName = "right-14 sm:left-14 sm:right-auto",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const { minChecklists, minSpecies, labelIds, excludedLabelIds } = hotspotFilters;
  const knownIds = (ids: string[]) => ids.filter((id) => labels.some((it) => it._id === id));
  const activeLabelIds = knownIds(labelIds);
  const activeExcludedIds = knownIds(excludedLabelIds);
  const activeCount =
    (showAllHotspots ? 0 : 1) +
    (activeLabelIds.length > 0 || activeExcludedIds.length > 0 ? 1 : 0) +
    (minChecklists !== DEFAULT_HOTSPOT_FILTERS.minChecklists ? 1 : 0) +
    (minSpecies !== DEFAULT_HOTSPOT_FILTERS.minSpecies ? 1 : 0);

  return (
    <div className="relative">
      <MapButton onClick={() => setOpen((o) => !o)} tooltip={open ? undefined : "Hotspots"} active={activeCount > 0}>
        <Icon name="sliders" />
      </MapButton>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div
            className={cn(
              "absolute top-0 z-40 w-[300px] bg-card border rounded-xl shadow-lg p-4",
              popoverClassName
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-foreground">Filters</div>
              <Button
                variant="link"
                onClick={() => {
                  setShowAllHotspots(true);
                  setHotspotFilters(DEFAULT_HOTSPOT_FILTERS);
                  setOpen(false);
                }}
                className={cn("text-[11px] font-semibold hover:opacity-80", activeCount === 0 && "invisible")}
              >
                Clear all
              </Button>
            </div>
            <label className="flex items-center justify-between gap-3 mb-4 cursor-pointer">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                Show saved only
              </span>
              <Switch checked={!showAllHotspots} onCheckedChange={(checked) => setShowAllHotspots(!checked)} />
            </label>
            {labels.length > 0 && (
              <>
                <LabelField
                  title="Include labels"
                  placeholder="Any label"
                  labels={labels}
                  selectedIds={activeLabelIds}
                  disabledIds={activeExcludedIds}
                  onChange={(labelIds) => setHotspotFilters({ labelIds })}
                />
                <LabelField
                  title="Exclude labels"
                  placeholder="None"
                  labels={labels}
                  selectedIds={activeExcludedIds}
                  disabledIds={activeLabelIds}
                  exclude
                  onChange={(excludedLabelIds) => setHotspotFilters({ excludedLabelIds })}
                />
              </>
            )}
            <div className={cn(!showAllHotspots && "opacity-40 pointer-events-none")}>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                Minimum checklists
              </div>
              <div className="mb-4">
                <MinStepper
                  value={minChecklists}
                  onChange={(minChecklists) => setHotspotFilters({ minChecklists })}
                  steps={MIN_CHECKLIST_STEPS}
                  min={0}
                />
              </div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                Minimum species
              </div>
              <MinStepper
                value={minSpecies}
                onChange={(minSpecies) => setHotspotFilters({ minSpecies })}
                steps={MIN_SPECIES_STEPS}
                min={0}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
