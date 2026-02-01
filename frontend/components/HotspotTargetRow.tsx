import React from "react";
import { Target } from "@birdplan/shared";
import FavButton from "components/FavButton";
import Icon from "components/Icon";
import type { HotspotSpeciesImportance } from "lib/helpers";

type Props = Target & {
  index: number;
  view: string;
  hotspotId: string;
  range: string;
  importance?: HotspotSpeciesImportance;
  onClick: () => void;
};

function importanceTooltip(importance: HotspotSpeciesImportance): string {
  if (importance.isBestAtThisHotspot && importance.isCritical) {
    return "Best place for this species on your trip; hard to see elsewhere.";
  }
  if (importance.isBestAtThisHotspot) {
    return "Best place for this species on your trip.";
  }
  if (importance.isCritical) {
    return "Hard to see at other saved hotspots.";
  }
  return "";
}

export default function HotspotTargetRow({
  code,
  name,
  percent,
  percentYr,
  index,
  view,
  hotspotId,
  range,
  importance,
  onClick,
}: Props) {
  const actualPercent = view === "all" ? percentYr : percent;
  const showImportance = importance && (importance.isBestAtThisHotspot || importance.isCritical);
  const tooltip = showImportance ? importanceTooltip(importance) : undefined;

  return (
    <div className="border-t border-gray-100 py-1.5 text-gray-500/80 text-[13px] grid gap-2 grid-cols-1 sm:grid-cols-5 mx-1">
      <div className="sm:col-span-3 pt-2 flex items-center gap-1.5">
        <span className="mr-2">{index + 1}.</span>
        {showImportance && (
          <span className="text-amber-500 flex-shrink-0" title={tooltip}>
            <Icon name="star" className="w-3.5 h-3.5" />
          </span>
        )}
        <button
          type="button"
          className="text-left hover:underline text-gray-900 text-sm ml-3"
          onClick={onClick}
          title="Click to view recent reports"
        >
          {name}
        </button>
      </div>
      <div className="flex gap-5 sm:col-span-2">
        <FavButton
          hotspotId={hotspotId}
          code={code}
          name={name}
          range={view === "all" ? "All Year" : range}
          percent={view === "all" ? percentYr : percent}
        />
        <div className="flex flex-col gap-1 w-full col-span-2">
          <div>
            <span className="text-gray-600 text-[15px] font-bold">
              {actualPercent > 1 ? Math.round(actualPercent) : actualPercent}%
            </span>{" "}
          </div>
          <div className="w-full bg-gray-200">
            <div className="h-2 bg-[#1c6900]" style={{ width: `${actualPercent}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
