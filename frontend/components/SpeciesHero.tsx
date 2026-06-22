import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import Card from "components/Card";
import MutualBadge from "components/MutualBadge";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";

type Props = {
  name: string;
  scientificName?: string;
  photoUrl?: string;
  photoBy?: string;
  ebirdUrl: string;
  starred: boolean;
  mutual: boolean;
  seen: boolean;
  canEdit: boolean;
  monthly: number[];
  startMonth?: number;
  endMonth?: number;
  onToggleStar: () => void;
  onMarkSeen: () => void;
  onShowMap: () => void;
};

export default function SpeciesHero({
  name,
  scientificName,
  photoUrl,
  photoBy,
  ebirdUrl,
  starred,
  mutual,
  seen,
  canEdit,
  monthly,
  startMonth,
  endMonth,
  onToggleStar,
  onMarkSeen,
  onShowMap,
}: Props) {
  return (
    <Card className="overflow-hidden flex flex-col sm:flex-row">
      <div
        className="bg-gray-100 sm:w-[360px] sm:shrink-0 aspect-4/3 sm:self-start bg-cover bg-center"
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
        title={photoBy ? `Photo by ${photoBy}` : undefined}
      >
        {!photoUrl && <div className="w-full h-full bg-gray-200" />}
      </div>

      <div className="flex-1 p-5 sm:px-6 sm:py-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{name}</h1>
              {starred && <Icon name="star" className="text-yellow-500 text-lg" />}
              {mutual && <MutualBadge size="md" />}
              {seen && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  <Icon name="check" className="text-[10px]" />
                  Seen
                </span>
              )}
            </div>
            {scientificName && <div className="italic text-gray-600 text-sm mt-1">{scientificName}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                aria-label="More actions"
              >
                <Icon name="verticalDots" className="text-base" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[220px]">
                <DropdownMenuItem onClick={onShowMap}>
                  <Icon name="map" className="text-gray-500" />
                  View Map
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleStar} disabled={!canEdit}>
                  <Icon
                    name={starred ? "star" : "starOutline"}
                    className={starred ? "text-yellow-500" : "text-gray-500"}
                  />
                  {starred ? "Remove star" : "Star species"}
                </DropdownMenuItem>
                <DropdownMenuItem render={<a href={ebirdUrl} target="_blank" rel="noopener noreferrer" />}>
                  <Icon name="external" className="text-gray-500" />
                  View on eBird
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMarkSeen} disabled={!canEdit || seen}>
                  <Icon name="check" className={seen ? "text-green-600" : "text-gray-500"} />
                  {seen ? "Marked as seen" : "Mark as seen"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <MonthlyFrequencyChart
          monthly={monthly}
          startMonth={startMonth}
          endMonth={endMonth}
          className="mt-10 sm:mt-auto"
        />
      </div>
    </Card>
  );
}
