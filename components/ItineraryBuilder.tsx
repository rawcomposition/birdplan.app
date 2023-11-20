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
import AngleDownBold from "icons/AngleDownBold";
import TravelTime from "components/TravelTime";

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

  const hotspotClick = (id: string) => {
    const hotspot = trip?.hotspots.find((it) => it.id === id);
    if (!hotspot) return toast.error("Hotspot not found");
    open("hotspot", { hotspot });
  };

  const markerClick = (id: string) => {};

  return (
    <div className="mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-gray-700">Trip Itinerary</h1>
        {canEdit && (
          <Button
            size="smPill"
            color="pillOutlineGray"
            className="flex items-center gap-2 print:hidden"
            onClick={() => setEditing((prev) => !prev)}
          >
            {isEditing ? <CheckIcon className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            <span>{isEditing ? "Done" : "Edit"}</span>
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
          <div key={id} className="mb-8">
            <div className="mb-3">
              <h1 className="text-xl font-bold text-gray-700">Day {i + 1}</h1>
              <span className="text-gray-500 text-sm">{date}</span>
            </div>
            {!!locations?.length && (
              <ul className="flex flex-col">
                {locations?.map(({ locationId, type }, index) => {
                  const location =
                    trip?.hotspots?.find((h) => h.id === locationId) || trip?.markers?.find((m) => m.id === locationId);
                  return (
                    <React.Fragment key={locationId}>
                      {index !== 0 && (
                        <li>
                          <TravelTime isEditing={isEditing} dayId={id} locationId={locationId} />
                        </li>
                      )}
                      <li
                        key={locationId}
                        className="flex items-center gap-2 text-sm text-gray-700 group relative p-3 bg-white rounded-lg shadow"
                        onClick={() =>
                          type === "hotspot"
                            ? open("hotspot", { hotspot: location })
                            : open("viewMarker", { marker: location })
                        }
                        aria-label="View location"
                        role="button"
                      >
                        <MarkerWithIcon
                          showStroke={false}
                          icon={(location as any)?.icon || "hotspot"}
                          className="inline-block scale-[.85] flex-shrink-0 print:hidden"
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
                    </React.Fragment>
                  );
                })}
              </ul>
            )}
            {isEditing && (
              <div className="flex justify-between items-center gap-2 mt-3">
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
