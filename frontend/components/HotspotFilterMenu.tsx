import React from "react";
import { cn } from "lib/utils";
import Icon from "components/Icon";
import MapButton from "components/MapButton";
import MinStepper from "components/MinStepper";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import { useTrip, DEFAULT_HOTSPOT_FILTERS } from "hooks/useTrip";

const MIN_CHECKLIST_STEPS = [0, 1, 5, 10, 25, 50, 100, 250, 500, 1000];
const MIN_SPECIES_STEPS = [0, 25, 50, 100, 150, 200, 250, 300, 400];

export default function HotspotFilterMenu() {
  const { showAllHotspots, setShowAllHotspots, hotspotFilters, setHotspotFilters } = useTrip();
  const [open, setOpen] = React.useState(false);
  const { minChecklists, minSpecies } = hotspotFilters;
  const activeCount =
    (showAllHotspots ? 0 : 1) +
    (minChecklists !== DEFAULT_HOTSPOT_FILTERS.minChecklists ? 1 : 0) +
    (minSpecies !== DEFAULT_HOTSPOT_FILTERS.minSpecies ? 1 : 0);

  return (
    <div className="relative">
      <MapButton onClick={() => setOpen((o) => !o)} tooltip={open ? undefined : "Hotspots"} active={showAllHotspots}>
        <Icon name="sliders" />
      </MapButton>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-30" />
          <div className="absolute top-0 right-14 sm:left-14 sm:right-auto z-40 w-[300px] bg-card border rounded-xl shadow-lg p-4">
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
