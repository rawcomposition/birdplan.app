import React from "react";
import { Day } from "@birdplan/shared";
import { useTrip } from "providers/trip";
import { useHotspotTargets } from "providers/hotspot-targets";
import { useProfile } from "providers/profile";
import {
  getHotspotSpeciesImportance,
  getDaySpeciesImportance,
  getBestHotspotsForSpecies,
  getAllHotspotsForSpecies,
} from "lib/helpers";
import Icon from "components/Icon";
import MerlinkLink from "components/MerlinLink";

type Props = {
  day: Day;
};

type SpeciesAtHotspot = {
  code: string;
  name: string;
  isBestAtThisHotspot: boolean;
  isCritical: boolean;
};

type HotspotSpecies = {
  hotspotId: string;
  hotspotName: string;
  species: SpeciesAtHotspot[];
};

function getSpeciesName(code: string, allTargets: { items: { code: string; name: string }[] }[]): string {
  for (const t of allTargets) {
    const item = t.items.find((it) => it.code === code);
    if (item) return item.name;
  }
  return code;
}

const COLLAPSED_SPECIES_PREVIEW = 4;

export default function DayImportantTargets({ day }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const { trip } = useTrip();
  const { allTargets } = useHotspotTargets();
  const { lifelist } = useProfile();

  const hotspotsInOrder = React.useMemo(
    () =>
      (day.locations ?? [])
        .filter((loc) => loc.type === "hotspot")
        .map((loc) => loc.locationId),
    [day.locations]
  );

  const dayIndex = React.useMemo(
    () => trip?.itinerary?.findIndex((d: Day) => d.id === day.id) ?? -1,
    [trip?.itinerary, day.id]
  );

  const dayImportance = React.useMemo(
    () =>
      allTargets?.length && trip?.itinerary?.length && dayIndex >= 0
        ? getDaySpeciesImportance(allTargets, trip.itinerary)
        : new Map(),
    [allTargets, trip?.itinerary, dayIndex]
  );

  const getPercentOnDay = React.useCallback(
    (hotspotId: string, code: string): number =>
      allTargets?.find((t) => t.hotspotId === hotspotId)?.items.find((it) => it.code === code)?.percent ?? 0,
    [allTargets]
  );

  const byHotspot = React.useMemo((): HotspotSpecies[] => {
    if (!allTargets?.length || !hotspotsInOrder.length || dayIndex < 0) return [];

    const result: HotspotSpecies[] = [];
    const dayImpByCode = dayImportance.get(dayIndex);

    for (const hotspotId of hotspotsInOrder) {
      const hotspot = trip?.hotspots?.find((h) => h.id === hotspotId);
      const importanceMap = getHotspotSpeciesImportance(allTargets, hotspotId);
      const species: SpeciesAtHotspot[] = [];

      for (const [code, imp] of importanceMap) {
        const dayImp = dayImpByCode?.get(code);
        const showByDay = dayImp?.isBestDay && dayImp?.isSubstantiallyBetterDay;
        if (!showByDay && !imp.isCritical) continue;
        if (lifelist?.includes(code)) continue;

        const bestPercentOnDay = Math.max(
          ...hotspotsInOrder.map((hid) => getPercentOnDay(hid, code))
        );
        const thisPercent = getPercentOnDay(hotspotId, code);
        const isBestAtThisHotspotOnDay = bestPercentOnDay > 0 && thisPercent === bestPercentOnDay;
        const firstBestHotspotId = hotspotsInOrder.find((hid) => getPercentOnDay(hid, code) === bestPercentOnDay);
        if (firstBestHotspotId !== hotspotId) continue;

        species.push({
          code,
          name: getSpeciesName(code, allTargets),
          isBestAtThisHotspot: isBestAtThisHotspotOnDay,
          isCritical: imp.isCritical,
        });
      }

      species.sort((a, b) => a.name.localeCompare(b.name));
      if (species.length > 0) {
        result.push({
          hotspotId,
          hotspotName: hotspot?.name ?? "Hotspot",
          species,
        });
      }
    }

    return result;
  }, [allTargets, hotspotsInOrder, trip?.hotspots, trip?.itinerary, dayIndex, dayImportance, getPercentOnDay, lifelist]);

  const locationIds = trip?.hotspots?.map((h) => h.id) ?? [];
  const hotspots = trip?.hotspots ?? [];

  const flatSpecies = React.useMemo(
    () => byHotspot.flatMap((h) => h.species),
    [byHotspot]
  );
  const collapsedPreview = flatSpecies.slice(0, COLLAPSED_SPECIES_PREVIEW);
  const hasMoreSpecies = flatSpecies.length > COLLAPSED_SPECIES_PREVIEW;

  if (!byHotspot.length) return null;

  return (
    <div className="mb-4 p-3 bg-amber-50/80 rounded-lg border border-amber-100">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5 hover:text-gray-800"
      >
        <Icon
          name="angleDown"
          className={`w-4 h-4 text-amber-500 transition-transform ${expanded ? "" : "-rotate-90"}`}
        />
        <Icon name="star" className="w-4 h-4 text-amber-500" />
        Key targets today
      </button>
      {!expanded && (
        <div className="text-sm text-gray-700 pl-6 space-y-1">
          {collapsedPreview.map(({ code, name }) => (
            <div key={code} className="flex items-center gap-1.5">
              <Icon name="star" className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <MerlinkLink code={code}>{name}</MerlinkLink>
            </div>
          ))}
          {hasMoreSpecies && (
            <div className="text-gray-500 italic" aria-hidden="true">
              …
            </div>
          )}
        </div>
      )}
      {expanded && (
      <div className="text-sm text-gray-700 space-y-3">
        {byHotspot.map(({ hotspotId, hotspotName, species }) => (
          <div key={hotspotId}>
            <div className="font-medium text-gray-800 mb-1">{hotspotName}</div>
            <ul className="space-y-1 pl-2 border-l-2 border-amber-200">
              {species.map(({ code, name, isBestAtThisHotspot, isCritical }) => {
                const bestHotspots = getBestHotspotsForSpecies(code, allTargets ?? [], locationIds, hotspots);
                const allHotspots =
                  bestHotspots.length === 0
                    ? getAllHotspotsForSpecies(code, allTargets ?? [], locationIds, hotspots)
                    : [];
                const showHover = bestHotspots.length > 0 || allHotspots.length > 0;
                const isBelowCutoff = bestHotspots.length === 0 && allHotspots.length > 0;
                const hoverList = bestHotspots.length > 0 ? bestHotspots : allHotspots;

                return (
                  <li key={code} className="group relative flex items-center gap-1.5">
                    <Icon name="star" className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <MerlinkLink code={code}>{name}</MerlinkLink>
                    <span className="text-gray-500 text-xs">
                      {isBestAtThisHotspot && isCritical
                        ? " · best here, hard elsewhere"
                        : isBestAtThisHotspot
                          ? " · best here"
                          : " · hard to see elsewhere"}
                    </span>
                    {showHover && (
                      <div className="absolute left-0 top-full z-10 mt-1 hidden min-w-[200px] max-w-[280px] rounded-lg border border-gray-200 bg-white py-2 shadow-lg group-hover:block">
                        <div className="border-b border-gray-100 px-3 pb-1.5 text-xs font-bold text-gray-600">
                          {isBelowCutoff ? "At saved hotspots (all below 5%)" : "Best saved hotspots"}
                        </div>
                        <ul className="max-h-48 overflow-y-auto px-3 pt-1.5 text-xs text-gray-700">
                          {hoverList.map((row, idx) => (
                            <li key={row.hotspotId} className="py-0.5">
                              {idx + 1}. {row.hotspotName}: {row.percent > 1 ? Math.round(row.percent) : row.percent}% (
                              {row.N} checklists)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
