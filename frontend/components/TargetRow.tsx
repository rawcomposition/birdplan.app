import React from "react";
import { useTrip } from "providers/trip";
import clsx from "clsx";
import Icon from "components/Icon";
import MerlinkLink from "components/MerlinLink";
import Button from "components/Button";
import useFetchRecentSpecies from "hooks/useFetchRecentSpecies";
import { dateTimeToRelative } from "lib/helpers";
import TextareaAutosize from "react-textarea-autosize";
import { Profile, Target } from "shared/types";
import { useSpeciesImages } from "providers/species-images";
import BestTargetHotspots from "components/BestTargetHotspots";
import useMutation from "hooks/useMutation";
import useTripMutation from "hooks/useTripMutation";
import { useQueryClient } from "@tanstack/react-query";

type PropsT = Target & {
  index: number;
};

export default function TargetRow({ index, code, name, percent }: PropsT) {
  const [expandedCodes, setExpandedCodes] = React.useState<string[]>([]);
  const { trip, canEdit, setSelectedSpecies } = useTrip();
  const [tempNotes, setTempNotes] = React.useState(trip?.targetNotes?.[code] || "");
  const { getSpeciesImg } = useSpeciesImages();
  const { recentSpecies, isLoading: loadingRecent } = useFetchRecentSpecies(trip?.region);
  const isStarred = trip?.targetStars?.includes(code);
  const queryClient = useQueryClient();
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

  const seenMutation = useMutation({
    url: `/profile/add-to-lifelist`,
    method: "POST",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/profile`] });
    },
    onMutate: async (data: any) => {
      await queryClient.cancelQueries({ queryKey: ["/profile"] });
      const prevData = queryClient.getQueryData([`/profile`]);

      queryClient.setQueryData<Profile | undefined>([`/profile`], (old) => {
        if (!old) return old;
        return { ...old, lifelist: [...old.lifelist, data.code] };
      });

      return { prevData };
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/profile`], context?.prevData);
    },
  });

  const handleSeen = (code: string, name: string) => {
    if (!confirm(`Are you sure you want to add ${name} to your life list?`)) return;
    seenMutation.mutate({ code });
  };

  const onToggleExpand = (code: string) => {
    if (expandedCodes.includes(code)) {
      setExpandedCodes(expandedCodes.filter((it) => it !== code));
    } else {
      setExpandedCodes([...expandedCodes, code]);
    }
  };

  const isExpanded = expandedCodes.includes(code);
  const lastReport = recentSpecies?.find((species) => species.code === code);

  const img = React.useMemo(() => getSpeciesImg(code), [code, getSpeciesImg]);

  const textareaBaseClasses =
    "input border bg-transparent shadow-none opacity-75 hover:opacity-100 focus-within:opacity-100 border-transparent hover:border-gray-200 focus-within:border-gray-200 my-1 h-14 block p-1.5";
  const mobileBtnClasses =
    "flex gap-2 items-center justify-center w-full bg-gray-200 text-gray-700 font-medium text-[12px] py-1.5 px-2.5 rounded-md";

  return (
    <React.Fragment>
      <tr className="w-full relative">
        <td className="text-gray-500 px-4 hidden sm:table-cell">{index + 1}.</td>
        <td className="relative">
          <div className="sm:hidden absolute top-1 left-2">
            {isStarred && <Icon name="star" className="text-yellow-500" />}
          </div>
          <MerlinkLink code={code}>
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
          </MerlinkLink>
        </td>
        <td>
          <div className="flex flex-col gap-1 w-full mt-1">
            <h3 className="text-sm lg:text-base font-bold pl-2 sm:pl-0">
              <MerlinkLink code={code} className="text-gray-800">
                {name}
              </MerlinkLink>
            </h3>
          </div>
        </td>
        <td className="hidden md:table-cell">
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
        <td className="text-gray-600 font-bold pr-1 pl-2 sm:pr-4 sm:pl-0">{percent}%</td>
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
                onClick={() => removeStarMutation.mutate({ code })}
                className="items-center justify-cente hidden sm:flex"
                disabled={!canEdit}
              >
                <Icon name="star" className="text-yellow-500 text-lg" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addStarMutation.mutate({ code })}
                className="items-center justify-cente hidden sm:flex"
                disabled={!canEdit}
              >
                <Icon name="starOutline" className="text-gray-500 text-lg" />
              </button>
            )}
            <Button
              color="pillOutlineGray"
              type="button"
              size="xsPill"
              className="flex items-center gap-2"
              onClick={() => setSelectedSpecies({ code: code, name: name })}
            >
              <Icon name="map" className="text-red-500/80" />
              <span className="hidden md:inline">View Map</span>
              <span className="md:hidden">Map</span>
            </Button>
            <button
              type="button"
              className={clsx("w-5 h-5 transition-all ease-in-out", isExpanded && "rotate-180")}
              onClick={() => onToggleExpand(code)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                <path d="M239 401c9.4 9.4 24.6 9.4 33.9 0L465 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-175 175L81 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9L239 401z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="!border-t-0">
          <td colSpan={1} className="hidden sm:table-cell" />
          <td colSpan={6} className="p-2 sm:hidden">
            <TextareaAutosize
              className={clsx(textareaBaseClasses, "w-full")}
              placeholder="Add notes..."
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              onBlur={(e) => setNotesMutation.mutate({ code, notes: e.target.value })}
              minRows={2}
              maxRows={6}
              cacheMeasurements
            />
            <BestTargetHotspots speciesCode={code} speciesName={name} />
            <div className="flex gap-2 mt-4">
              {isStarred ? (
                <button
                  type="button"
                  onClick={() => removeStarMutation.mutate({ code })}
                  className={mobileBtnClasses}
                  disabled={!canEdit}
                >
                  <Icon name="star" className="text-yellow-500 text-lg" />
                  Remove star
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => addStarMutation.mutate({ code })}
                  className={mobileBtnClasses}
                  disabled={!canEdit}
                >
                  <Icon name="starOutline" className="text-gray-500 text-lg" />
                  Add star
                </button>
              )}
              {canEdit && (
                <button type="button" className={mobileBtnClasses} onClick={() => handleSeen(code, name)}>
                  <Icon name="check" className="text-gray-500 text-lg" />
                  Mark as seen
                </button>
              )}
            </div>
          </td>
          <td colSpan={7} className="pb-4 hidden sm:table-cell">
            <BestTargetHotspots speciesCode={code} speciesName={name} className="mb-4" />
            {canEdit && (
              <>
                <span className="text-gray-600 font-medium text-sm">Species actions:</span>{" "}
                <button type="button" className="text-sky-600 font-bold text-sm" onClick={() => handleSeen(code, name)}>
                  Mark as seen
                </button>
              </>
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}
