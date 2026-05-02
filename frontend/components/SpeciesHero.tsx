import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";

type Props = {
  name: string;
  scientificName?: string;
  photoUrl?: string;
  photoBy?: string;
  ebirdUrl: string;
  starred: boolean;
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row">
      <div
        className="bg-gray-100 sm:w-[280px] sm:flex-shrink-0 aspect-[4/3] sm:aspect-auto bg-cover bg-center relative"
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
        title={photoBy ? `Photo by ${photoBy}` : undefined}
      >
        {!photoUrl && <div className="w-full h-full bg-gray-200" />}
      </div>

      <div className="flex-1 p-5 sm:px-6 sm:py-5 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">{name}</h1>
            {scientificName && <div className="italic text-gray-600 text-sm mt-1">{scientificName}</div>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onShowMap}
              className="h-9 w-9 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 grid place-items-center"
              title="Show map"
              aria-label="Show map"
            >
              <Icon name="map" className="text-base text-red-500/80" />
            </button>
            <button
              type="button"
              onClick={onToggleStar}
              disabled={!canEdit}
              className={clsx(
                "h-9 w-9 rounded-lg border grid place-items-center disabled:opacity-60",
                starred
                  ? "border-yellow-200 bg-yellow-50 text-yellow-500"
                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
              )}
              title={starred ? "Unstar species" : "Star species"}
              aria-label={starred ? "Unstar species" : "Star species"}
            >
              <Icon name={starred ? "star" : "starOutline"} className="text-base" />
            </button>
            <a
              href={ebirdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium inline-flex items-center gap-1.5"
            >
              eBird <Icon name="external" className="text-xs" />
            </a>
            <button
              type="button"
              onClick={onMarkSeen}
              disabled={!canEdit || seen}
              className={clsx(
                "h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-80",
                seen
                  ? "border border-green-600 bg-green-50 text-green-600"
                  : "bg-gray-800 text-white hover:bg-gray-900"
              )}
            >
              <Icon name="check" className="text-sm" />
              {seen ? "Seen" : "Mark as seen"}
            </button>
          </div>
        </div>

        <MonthlyFrequencyChart monthly={monthly} startMonth={startMonth} endMonth={endMonth} className="mt-auto" />
      </div>
    </div>
  );
}
