import React from "react";
import { useTrip } from "providers/trip";
import clsx from "clsx";
import Icon from "components/Icon";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";
import TextareaAutosize from "react-textarea-autosize";
import { Target } from "@birdplan/shared";
import { useSpeciesImages } from "providers/species-images";
import useTripMutation from "hooks/useTripMutation";
import { useRouter } from "next/router";

type PropsT = Target & {
  index: number;
};

export default function TargetRow({ index, code, name, frequency }: PropsT) {
  const { trip, canEdit } = useTrip();
  const router = useRouter();
  const [tempNotes, setTempNotes] = React.useState(trip?.targetNotes?.[code] || "");
  const { getSpeciesImg } = useSpeciesImages();
  const { recentSpecies, isLoading: loadingRecent } = useFetchRecentSpecies(trip?.region);
  const isStarred = trip?.targetStars?.includes(code);
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

  const setNotesMutation = useTripMutation<{ code: string; notes: string }>({
    url: `/trips/${trip?._id}/targets/set-notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      targetNotes: { ...(old.targetNotes || {}), [input.code]: input.notes },
    }),
  });

  const lastReport = recentSpecies?.find((species) => species.code === code);
  const img = React.useMemo(() => getSpeciesImg(code), [code, getSpeciesImg]);

  const handleRowClick = () => {
    if (!trip?._id) return;
    router.push(`/${trip._id}/targets/${code}`);
  };

  const stop = (e: React.MouseEvent | React.SyntheticEvent) => e.stopPropagation();

  const textareaBaseClasses =
    "input border bg-transparent shadow-none opacity-75 hover:opacity-100 focus-within:opacity-100 border-transparent hover:border-gray-200 focus-within:border-gray-200 my-1 h-14 block p-1.5";

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
            className="w-16 aspect-[4/3] min-w-[3.5rem] rounded object-cover my-1 mx-1 sm:mx-0"
            loading="lazy"
            title={img?.by ? `Photo by ${img.by}` : ""}
          />
        ) : (
          <div className="w-16 aspect-[4/3] min-w-[3.5rem] rounded bg-gray-200 my-1 mx-1 sm:mx-0" />
        )}
      </td>
      <td>
        <div className="flex flex-col gap-1 w-full mt-1">
          <h3 className="text-sm lg:text-base font-bold pl-2 sm:pl-0 text-gray-800">{name}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell" onClick={stop}>
        <TextareaAutosize
          className={clsx(textareaBaseClasses, "w-[150px] md:w-[200px] lg:w-[300px] md:mr-2 lg:mr-8 text-[13px]")}
          placeholder="Add notes..."
          value={tempNotes}
          onChange={(e) => setTempNotes(e.target.value)}
          onBlur={(e) => setNotesMutation.mutate({ code, notes: e.target.value })}
          minRows={2}
          maxRows={6}
          cacheMeasurements
        />
      </td>
      <td className="text-gray-600 font-bold pr-1 pl-2 sm:pr-4 sm:pl-0">{frequency}%</td>
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
