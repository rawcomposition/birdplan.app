import React from "react";
import { useTrip } from "hooks/useTrip";
import Icon from "components/Icon";
import MonthlyFrequencyChart from "components/MonthlyFrequencyChart";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";
import type { Target } from "@birdplan/shared";
import { useSpeciesImages } from "hooks/useSpeciesImages";
import useTripMutation from "hooks/useTripMutation";
import MutualBadge from "components/MutualBadge";
import { useNavigate } from "react-router-dom";

type PropsT = Target & {
  index: number;
  samples?: number[];
  isMutual?: boolean;
};

export default function TargetRow({ index, code, name, frequency, obs, samples, isMutual }: PropsT) {
  const { trip, canEdit } = useTrip();
  const navigate = useNavigate();
  const { getSpeciesImg } = useSpeciesImages();
  const { recentSpecies, isLoading: loadingRecent } = useFetchRecentSpecies(trip?.region);
  const isStarred = trip?.targetStars?.includes(code);
  const notes = trip?.targetNotes?.[code];
  const regionCode = trip?.region.split(",")[0] || "";

  const addStarMutation = useTripMutation<{ code: string }>({
    url: `/trips/${trip?._id}/targets/add-star`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetStars: [...(old.targetStars ?? []), input.code],
    }),
  });

  const removeStarMutation = useTripMutation<{ code: string }>({
    url: `/trips/${trip?._id}/targets/remove-star`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetStars: (old.targetStars || []).filter((it) => it !== input.code),
    }),
  });

  const lastReport = recentSpecies?.find((species) => species.code === code);
  const img = getSpeciesImg(code);

  const monthly =
    obs && samples ? obs.map((o, i) => (samples[i] > 0 ? Math.round((o / samples[i]) * 1000) / 10 : 0)) : null;

  const handleRowClick = () => {
    if (!trip?._id) return;
    navigate(`/${trip._id}/targets/${code}`);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <tr
      className="w-full relative cursor-pointer hover:bg-sky-50/50"
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
    >
      <td className="text-gray-500 px-4 hidden sm:table-cell">{index + 1}.</td>
      <td className="relative">
        <div className="sm:hidden absolute top-1 left-2">
          {isStarred && <Icon name="star" className="text-yellow-500" />}
        </div>
        {img ? (
          <img
            src={img.url}
            alt={name}
            className="w-16 aspect-4/3 min-w-14 rounded object-cover my-1 mx-1 sm:mx-0"
            loading="lazy"
            title={img?.by ? `Photo by ${img.by}` : ""}
          />
        ) : (
          <div className="w-16 aspect-4/3 min-w-14 rounded bg-gray-200 my-1 mx-1 sm:mx-0" />
        )}
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
          <MonthlyFrequencyChart
            monthly={monthly}
            startMonth={trip?.startMonth}
            endMonth={trip?.endMonth}
            variant="mini"
          />
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
                removeStarMutation.mutate({ code });
              }}
              className="items-center justify-center hidden sm:flex"
              disabled={!canEdit}
              aria-label="Remove star"
            >
              <Icon name="star" className="text-yellow-500 text-lg" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                stop(e);
                addStarMutation.mutate({ code });
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
