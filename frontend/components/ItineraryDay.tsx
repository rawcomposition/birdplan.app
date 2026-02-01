import React from "react";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import dayjs from "dayjs";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import TravelTime from "components/TravelTime";
import InputNotesSimple from "components/InputNotesSimple";
import Icon from "components/Icon";
import useTripMutation from "hooks/useTripMutation";
import { useMutationState } from "@tanstack/react-query";
import { Day } from "@birdplan/shared";
import { removeInvalidTravelData, moveLocation } from "lib/itinerary";
import DayImportantTargets from "components/DayImportantTargets";

type PropsT = {
  day: Day;
  isEditing: boolean;
};

export default function ItineraryDay({ day, isEditing }: PropsT) {
  const { trip, isFetching: isFetchingTrip } = useTrip();
  const { open } = useModal();

  const isAddingLocation = useMutationState({
    filters: { mutationKey: [`/trips/${trip?._id}/itinerary/${day.id}/add-location`] },
    select: (mutation) => mutation?.state.status === "pending",
  })?.some(Boolean);

  const isCalculatingTravelTime = useMutationState({
    filters: { mutationKey: [`/trips/${trip?._id}/itinerary/${day.id}/calc-travel-time`] },
    select: (mutation) => mutation?.state.status === "pending",
  })?.some(Boolean);

  const removeDayMutation = useTripMutation({
    url: `/trips/${trip?._id}/itinerary/${day.id}`,
    method: "DELETE",
    updateCache: (old, input) => ({
      ...old,
      itinerary: old.itinerary?.filter((it) => it.id !== day.id) || [],
    }),
  });

  const removeLocationMutation = useTripMutation<{ id: string }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/remove-location`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary:
        old.itinerary?.map((it) =>
          it.id === day.id
            ? { ...it, locations: removeInvalidTravelData(it.locations?.filter((loc) => loc.id !== input.id) || []) }
            : it
        ) || [],
    }),
  });

  const moveLocationMutation = useTripMutation<{ id: string; direction: "up" | "down" }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/move-location`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary:
        old.itinerary?.map((it) =>
          it.id === day.id
            ? {
                ...it,
                locations: removeInvalidTravelData(moveLocation(it.locations, input.id, input.direction)),
              }
            : it
        ) || [],
    }),
  });

  const setNotesMutation = useTripMutation<{ notes: string }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/set-notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: old.itinerary?.map((it) => (it.id === day.id ? { ...it, notes: input.notes } : it)) || [],
    }),
  });

  const handleRemoveDay = () => {
    if (day.locations.length && !confirm("Are you sure you want to remove this day?")) return;
    removeDayMutation.mutate({});
  };

  const isLoading =
    moveLocationMutation.isPending ||
    removeLocationMutation.isPending ||
    removeDayMutation.isPending ||
    isCalculatingTravelTime ||
    isAddingLocation ||
    isFetchingTrip;

  return (
    <>
      {trip?.itinerary?.map(({ id: dayId, notes, locations }, i) => {
        const date = dayjs(trip.startDate).add(i, "day").format("dddd, MMMM D");
        return (
          <div key={dayId} className="mb-8">
            <div className="mb-3">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-700">Day {i + 1}</h1>
                <span className="text-gray-500 text-[13px]">{date}</span>
              </div>
              <InputNotesSimple
                value={notes}
                onBlur={(value) => setNotesMutation.mutate({ notes: value })}
                className="mt-1 mb-4"
                canEdit={isEditing}
              />
            </div>
            {locations?.some((loc) => loc.type === "hotspot") && (
              <DayImportantTargets day={{ id: dayId, notes, locations }} />
            )}
            {!!locations?.length && (
              <ul className="flex flex-col">
                {locations?.map(({ locationId, type, id }, index) => {
                  const location =
                    trip?.hotspots?.find((h) => h.id === locationId) || trip?.markers?.find((m) => m.id === locationId);

                  return (
                    <React.Fragment key={id}>
                      {index !== 0 && (
                        <li>
                          <TravelTime isLoading={isLoading} isEditing={isEditing} dayId={dayId} id={id} />
                        </li>
                      )}
                      <li className="flex items-start gap-2 text-sm text-gray-700 group relative p-3 bg-white rounded-lg shadow">
                        <button
                          className="flex gap-2 text-left -my-[9px] py-3 -ml-4 pl-4 grow"
                          onClick={
                            location
                              ? () =>
                                  type === "hotspot"
                                    ? open("hotspot", { hotspot: location })
                                    : open("viewMarker", { markerId: location.id })
                              : undefined
                          }
                          disabled={!location}
                        >
                          {location ? (
                            <MarkerWithIcon
                              showStroke={false}
                              icon={(location as any)?.icon || "hotspot"}
                              className="inline-block scale-[.85] flex-shrink-0 print:hidden"
                            />
                          ) : (
                            <Icon name="warning" className="text-red-500 text-[22px]" />
                          )}
                          <span>
                            <div className="truncate font-medium mt-[2px]">{location?.name || "Unknown Location"}</div>
                            {location?.notes && (
                              <span className="text-gray-700 text-sm relative group whitespace-pre-wrap">
                                {location.notes}
                              </span>
                            )}
                          </span>
                        </button>
                        {isEditing && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            {index !== locations.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveLocationMutation.mutate({ id, direction: "down" })}
                                className="text-[16px] p-1 text-gray-600 sm:opacity-0 group-hover:opacity-100 transition-opacity -mt-px"
                              >
                                <Icon name="angleDownBold" />
                              </button>
                            )}
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => moveLocationMutation.mutate({ id, direction: "up" })}
                                className="text-[16px] p-1 -mt-1 text-gray-600 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Icon name="angleDownBold" className="rotate-180" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeLocationMutation.mutate({ id })}
                              className="text-[16px] p-1 -mt-1 text-gray-600 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Icon name="xMarkBold" />
                            </button>
                          </div>
                        )}
                      </li>
                    </React.Fragment>
                  );
                })}
              </ul>
            )}
            {isEditing && (
              <div className="flex justify-between items-center gap-2 mt-3">
                <Button size="xs" color="gray" onClick={() => open("addItineraryLocation", { dayId })}>
                  + Add Location
                </Button>
                <button type="button" onClick={handleRemoveDay} className="text-[12px] py-0.5 px-1.5 text-red-700">
                  Remove day
                </button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
