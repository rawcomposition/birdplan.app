import React from "react";
import Input from "components/Input";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import Pencil from "icons/Pencil";
import CheckIcon from "icons/Check";
import XMarkBold from "icons/XMarkBold";
import clsx from "clsx";
import AngleDownBold from "icons/AngleDownBold";

export default function ItineraryBuilder() {
  const {
    trip,
    canEdit,
    setStartDate,
    appendItineraryDay,
    removeItineraryDay,
    removeItineraryDayLocation,
    moveItineraryDayLocation,
  } = useTrip();
  const { open } = useModal();

  const [editing, setEditing] = React.useState(!trip?.startDate || !trip?.itinerary?.length);
  const isEditing = canEdit && editing;

  const submitStartDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const date = form.date.value;
    if (!date) return toast.error("Please choose a date");
    setStartDate(date);
    appendItineraryDay();
  };

  const handleRemoveDay = (dayId: string) => {
    if (!confirm("Are you sure you want to remove this day?")) return;
    removeItineraryDay(dayId);
  };

  return (
    <div className="mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-700">Itinerary</h1>
        {canEdit && !isEditing && (
          <Button
            size="smPill"
            color="pillOutlineGray"
            className="flex items-center gap-2 print:hidden"
            onClick={() => setEditing(true)}
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </Button>
        )}
        {isEditing && (
          <Button
            size="smPill"
            color="pillOutlineGray"
            className="flex items-center gap-2"
            onClick={() => setEditing(false)}
          >
            <CheckIcon className="w-4 h-4" />
            <span>Done</span>
          </Button>
        )}
      </div>
      {canEdit && !trip?.startDate && (
        <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Choose start date</h2>
          <form className="flex gap-2" onSubmit={submitStartDate}>
            <Input name="date" type="date" />
            <Button type="submit" color="primary">
              Set
            </Button>
          </form>
        </div>
      )}
      {!canEdit && !trip?.startDate && (
        <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">No itinerary has been set for this trip yet.</div>
      )}
      {trip?.itinerary.map(({ id, locations }, i) => {
        const date = dayjs(trip.startDate).add(i, "day").format("dddd, MMMM D");
        return (
          <div key={id} className="pt-3 p-5 bg-white rounded-lg shadow mb-8 relative space-y-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-700">Day {i + 1}</h2>
              <span className="text-gray-500 text-sm">{date}</span>
            </div>
            {!!locations?.length && (
              <ul className="flex flex-col gap-2.5">
                {locations?.map(({ locationId }, index) => {
                  const location =
                    trip?.hotspots?.find((h) => h.id === locationId) || trip?.markers?.find((m) => m.id === locationId);
                  return (
                    <li
                      key={locationId}
                      className={clsx(
                        "flex items-center gap-2 text-sm text-gray-700 group relative",
                        isEditing &&
                          "border rounded p-1 -mx-1 border-transparent hover:border-gray-200 transition-colors"
                      )}
                    >
                      <MarkerWithIcon
                        showStroke={false}
                        icon={(location as any)?.icon || "hotspot"}
                        className="inline-block scale-[.8] flex-shrink-0 print:hidden"
                      />
                      <span className="truncate font-medium">{location?.name || "Unknown Location"}</span>
                      {isEditing && (
                        <div className="flex items-center gap-1.5 ml-auto">
                          {index !== locations.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveItineraryDayLocation(id, locationId, "down")}
                              className="text-[16px] p-1 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity -mt-px"
                            >
                              <AngleDownBold />
                            </button>
                          )}
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => moveItineraryDayLocation(id, locationId, "up")}
                              className="text-[16px] p-1 -mt-1 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <AngleDownBold className="rotate-180" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItineraryDayLocation(id, locationId)}
                            className="text-[16px] p-1 -mt-1 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkBold />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {isEditing && (
              <div className="flex justify-between items-center gap-2">
                <Button size="xs" color="gray" onClick={() => open("addItineraryLocation", { dayId: id })}>
                  + Add Location
                </Button>
                <button
                  type="button"
                  onClick={() => handleRemoveDay(id)}
                  className="text-[12px] py-0.5 px-1.5 text-red-700"
                >
                  Remove day
                </button>
              </div>
            )}
          </div>
        );
      })}
      {isEditing && (
        <Button color="primary" onClick={appendItineraryDay} className="mb-8">
          Add Day
        </Button>
      )}
    </div>
  );
}
