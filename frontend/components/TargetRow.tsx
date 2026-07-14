import React from "react";
import Icon from "components/Icon";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";
import { dateTimeToRelative } from "lib/helpers";
import type { Target } from "@birdplan/shared";
import type { RecentSpecies } from "lib/types";
import SpeciesThumb from "components/SpeciesThumb";
import MutualBadge from "components/MutualBadge";
import { useNavigate } from "react-router-dom";

type PropsT = Target & {
  index: number;
  samples?: number[];
  isMutual?: boolean;
  tripId?: string;
  regionCode: string;
  startMonth?: number;
  endMonth?: number;
  canEdit?: boolean;
  isStarred?: boolean;
  notes?: string;
  img?: { url: string; by?: string };
  lastReport?: RecentSpecies;
  loadingRecent?: boolean;
  addStar: (input: { code: string }) => void;
  removeStar: (input: { code: string }) => void;
};

function TargetRow({
  index,
  code,
  name,
  frequency,
  obs,
  samples,
  isMutual,
  tripId,
  regionCode,
  startMonth,
  endMonth,
  canEdit,
  isStarred,
  notes,
  img,
  lastReport,
  loadingRecent,
  addStar,
  removeStar,
}: PropsT) {
  const navigate = useNavigate();

  const monthly =
    obs && samples ? obs.map((o, i) => (samples[i] > 0 ? Math.round((o / samples[i]) * 1000) / 10 : 0)) : null;

  const handleRowClick = () => {
    if (!tripId) return;
    navigate(`/${tripId}/targets/${code}`);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <tr
      className="w-full relative cursor-pointer hover:bg-primary/5"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
    >
      <td className="text-gray-500 px-4 hidden sm:table-cell">{index + 1}.</td>
      <td className="relative">
        <div className="sm:hidden absolute top-1 left-2">
          {isStarred && <Icon name="star" className="text-star" />}
        </div>
        <SpeciesThumb img={img} name={name} className="w-16 min-w-14 my-1 mx-1 sm:mx-0" />
      </td>
      <td>
        <div className="flex items-center gap-1.5 w-full mt-1 pl-2 sm:pl-0">
          <h3 className="text-sm lg:text-base font-bold text-gray-800">{name}</h3>
          {isMutual && <MutualBadge />}
        </div>
      </td>
      <td className="hidden md:table-cell">
        {notes && (
          <p className="w-[150px] md:w-[200px] lg:w-[300px] md:mr-2 lg:mr-8 text-[13px] text-gray-600 whitespace-pre-wrap line-clamp-3">
            {notes}
          </p>
        )}
      </td>
      <td className="text-gray-600 font-bold pr-1 pl-2 sm:pr-4 sm:pl-0">{frequency}%</td>
      <td className="hidden md:table-cell pr-4 lg:pr-6">
        {monthly && (
          <MonthlyFrequencyChart monthly={monthly} startMonth={startMonth} endMonth={endMonth} variant="mini" />
        )}
      </td>
      <td className="text-[14px] text-gray-600 hidden sm:table-cell">
        {lastReport?.date
          ? dateTimeToRelative(lastReport.date, regionCode, true)
          : loadingRecent
            ? "loading last seen..."
            : "> 30 days ago"}
      </td>
      <td>
        <div className="flex items-center gap-4 sm:gap-6 mr-4 sm:mr-6 ml-2 justify-end whitespace-nowrap">
          {isStarred ? (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                removeStar({ code });
              }}
              className="items-center justify-center hidden sm:flex"
              disabled={!canEdit}
              aria-label="Remove star"
            >
              <Icon name="star" className="text-star text-lg" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                addStar({ code });
              }}
              className="items-center justify-center hidden sm:flex"
              disabled={!canEdit}
              aria-label="Add star"
            >
              <Icon name="starOutline" className="text-gray-500 text-lg" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default TargetRow;
