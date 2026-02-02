import React from "react";
import { Day } from "@birdplan/shared";
import { useTrip } from "providers/trip";
import { useHotspotTargets } from "providers/hotspot-targets";
import { useProfile } from "providers/profile";
import {
  getHotspotSpeciesImportance,
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

export default function DayImportantTargets({ day }: Props) {
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

  const byHotspot = React.useMemo((): HotspotSpecies[] => {
    if (!allTargets?.length || !hotspotsInOrder.length) return [];

    const result: HotspotSpecies[] = [];

    for (const hotspotId of hotspotsInOrder) {
      const hotspot = trip?.hotspots?.find((h) => h.id === hotspotId);
      const importanceMap = getHotspotSpeciesImportance(allTargets, hotspotId);
      const species: SpeciesAtHotspot[] = [];

      for (const [code, imp] of importanceMap) {
        if (!imp.isBestAtThisHotspot && !imp.isCritical) continue;
        if (lifelist?.includes(code)) continue;
        species.push({
          code,
          name: getSpeciesName(code, allTargets),
          isBestAtThisHotspot: imp.isBestAtThisHotspot,
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
  }, [allTargets, hotspotsInOrder, trip?.hotspots, lifelist]);

  const locationIds = trip?.hotspots?.map((h) => h.id) ?? [];
  const hotspots = trip?.hotspots ?? [];

  if (!byHotspot.length) return null;

  return (
    <div className="mb-4 p-3 bg-amber-50/80 rounded-lg border border-amber-100">
      <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
        <Icon name="star" className="w-4 h-4 text-amber-500" />
        Key targets today
      </h3>
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
    </div>
  );
}
