import React from "react";
import Header from "components/Header";
import Head from "next/head";
import TripNav from "components/TripNav";
import { useUser } from "providers/user";
import ErrorBoundary from "components/ErrorBoundary";
import Input from "components/Input";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";
import Icon from "components/Icon";
import NotFound from "components/NotFound";
import useTripMutation from "hooks/useTripMutation";
import { nanoId } from "lib/helpers";
import ItineraryDay from "components/ItineraryDay";
import dayjs from "dayjs";

function daysBetweenInclusive(startDateStr: string, endDateStr: string): number {
  const start = dayjs(startDateStr);
  const end = dayjs(endDateStr);
  return end.diff(start, "day") + 1;
}

export default function Itinerary() {
  const { user } = useUser();
  const { is404, trip, canEdit } = useTrip();
  const { close, modalId } = useModal();
  const hasStartDate = !!trip?.startDate;
  const [editingStartDate, setEditingStartDate] = React.useState(false);
  const shouldDefaultEdit = !!(trip && !trip?.startDate) || !!(trip && !trip?.itinerary?.length);
  const [editing, setEditing] = React.useState(shouldDefaultEdit);
  const isEditing = canEdit && editing;

  React.useEffect(() => {
    if (shouldDefaultEdit) setEditing(true);
  }, [shouldDefaultEdit]);

  const setStartDateMutation = useTripMutation<{ startDate: string }>({
    url: `/trips/${trip?._id}/set-start-date`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      startDate: input.startDate,
    }),
  });

  const setDateRangeMutation = useTripMutation<{ startDate: string; endDate: string }>({
    url: `/trips/${trip?._id}/set-date-range`,
    method: "PATCH",
    updateCache: (old, input) => {
      const M = old.itinerary?.length ?? 0;
      const N = daysBetweenInclusive(input.startDate, input.endDate);
      let newItinerary = old.itinerary ?? [];
      if (M === 0) {
        newItinerary = Array.from({ length: N }, () => ({ id: nanoId(6), locations: [] }));
      } else if (N > M) {
        const extra = Array.from({ length: N - M }, () => ({ id: nanoId(6), locations: [] }));
        newItinerary = [...newItinerary, ...extra];
      }
      return { ...old, startDate: input.startDate, itinerary: newItinerary };
    },
  });

  const addDayMutation = useTripMutation<{ id: string; locations: any[] }>({
    url: `/trips/${trip?._id}/itinerary`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      itinerary: [...(old.itinerary || []), input],
    }),
  });

  const derivedEndDate =
    trip?.startDate && trip?.itinerary?.length
      ? dayjs(trip.startDate).add((trip.itinerary.length ?? 1) - 1, "day").format("YYYY-MM-DD")
      : trip?.startDate ?? "";

  const submitDateRange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    if (!startDate) return toast.error("Please choose a start date");
    if (!endDate) return toast.error("Please choose an end date");
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (end.isBefore(start)) return toast.error("End date cannot be before start date");

    const M = trip?.itinerary?.length ?? 0;
    const N = daysBetweenInclusive(startDate, endDate);
    if (M > 0 && N < M) {
      const lastDayDate = dayjs(trip!.startDate!).add(M - 1, "day").format("MMMM D, YYYY");
      toast.error(
        `End date cannot be before ${lastDayDate} because you have ${M} itinerary days. Use "Remove day" to shorten the trip.`
      );
      return;
    }

    setDateRangeMutation.mutate({ startDate, endDate });
    setEditingStartDate(false);
    setEditing(true);
  };

  const handleAddDay = () => {
    addDayMutation.mutate({ id: nanoId(6), locations: [] });
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    const isButton = (e.target as HTMLElement).closest("button");
    if (isButton) return;
    modalId && close();
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      {trip && (
        <Head>
          <title>{`${trip.name} | BirdPlan.app`}</title>
        </Head>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?.uid ? "/trips" : "/" }} />
      <TripNav active="itinerary" />
      <main className="flex h-[calc(100%-60px-55px)]">
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            <div className="h-full overflow-auto" onClick={handleDivClick}>
              <div className="mt-2 sm:mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
                <div className="sticky top-0 z-10 bg-white pb-2 mb-8 sm:mb-10 -mx-4 px-4 md:-mx-0 md:px-0">
                  <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-700">Trip Itinerary</h1>
                    {canEdit && hasStartDate && (
                      <Button
                        size="smPill"
                        color="pillOutlineGray"
                        className="flex items-center gap-2 print:hidden"
                        onClick={() => setEditing((prev) => !prev)}
                      >
                        {isEditing ? (
                          <Icon name="check" className="w-4 h-4" />
                        ) : (
                          <Icon name="pencil" className="w-4 h-4" />
                        )}
                        <span>{isEditing ? "Done" : "Edit"}</span>
                      </Button>
                    )}
                  </div>
                  {canEdit && !!trip?.startDate && isEditing && !editingStartDate && (
                    <Button
                      type="button"
                      size="smPill"
                      color="pillOutlineGray"
                      className="mt-2 print:hidden inline-flex gap-2"
                      onClick={() => setEditingStartDate(true)}
                    >
                      <Icon name="calendar" className="w-4 h-4" />
                      Edit dates
                    </Button>
                  )}
                </div>

                {canEdit && (!trip?.startDate || editingStartDate) && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Trip dates</h2>
                    <form className="flex flex-col gap-4" onSubmit={submitDateRange}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <label className="text-sm font-medium text-gray-700">Start date</label>
                        <Input
                          name="startDate"
                          type="date"
                          defaultValue={trip?.startDate}
                          className="flex-grow max-w-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <label className="text-sm font-medium text-gray-700">End date</label>
                        <Input
                          name="endDate"
                          type="date"
                          defaultValue={derivedEndDate || trip?.startDate}
                          min={trip?.startDate}
                          className="flex-grow max-w-xs"
                        />
                      </div>
                      <Button type="submit" color="primary">
                        Set dates
                      </Button>
                    </form>
                  </div>
                )}
                {!canEdit && !trip?.startDate && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
                    No itinerary has been set for this trip yet.
                  </div>
                )}
                {trip?.itinerary?.map((day) => <ItineraryDay key={day.id} day={day} isEditing={isEditing} />)}
                {isEditing && hasStartDate && (
                  <Button color="primary" onClick={handleAddDay} className="mb-8">
                    Add Day
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </main>
    </div>
  );
}
