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
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { nanoId } from "lib/helpers";
import ItineraryDay from "components/ItineraryDay";

export default function Itinerary() {
  const { user } = useUser();
  const { is404, trip, canEdit, setTripCache } = useTrip();
  const { close, modalId } = useModal();
  const queryClient = useQueryClient();
  const hasStartDate = !!trip?.startDate;
  const [editingStartDate, setEditingStartDate] = React.useState(false);
  const [editing, setEditing] = React.useState(!!(trip && !trip?.startDate) || !!(trip && !trip?.itinerary?.length));
  const isEditing = canEdit && editing;

  const setStartDateMutation = useMutation({
    url: `/api/trips/${trip?._id}/set-start-date`,
    method: "PATCH",
    onMutate: (data: any) =>
      setTripCache((old) => ({
        ...old,
        startDate: data.startDate,
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });

  const addDayMutation = useMutation({
    url: `/api/trips/${trip?._id}/itinerary`,
    method: "POST",
    onMutate: (data) =>
      setTripCache((old) => ({
        ...old,
        itinerary: [...(old.itinerary || []), data as any],
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });

  const submitStartDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const date = form.date.value;
    if (!date) return toast.error("Please choose a date");
    setStartDateMutation.mutate({ startDate: date });
    setEditingStartDate(false);
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
      <main className="flex h-[calc(100%-60px-52px)]">
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            <div className="h-full overflow-auto" onClick={handleDivClick}>
              <div className="mt-2 sm:mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
                <div className="mb-8 sm:mb-10">
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
                  {canEdit && !!trip?.startDate && !editingStartDate && (
                    <button
                      type="button"
                      onClick={() => setEditingStartDate(true)}
                      className="text-[14px] text-gray-600 hover:text-gray-700 block mt-2 hover:underline"
                    >
                      Edit start date
                    </button>
                  )}
                </div>

                {canEdit && (!trip?.startDate || editingStartDate) && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Choose start date</h2>
                    <form className="flex gap-2" onSubmit={submitStartDate}>
                      <Input
                        name="date"
                        type="date"
                        defaultValue={trip?.startDate}
                        className="flex-grow flex xs:block"
                      />
                      <Button type="submit" color="primary">
                        Set
                      </Button>
                    </form>
                  </div>
                )}
                {!canEdit && !trip?.startDate && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
                    No itinerary has been set for this trip yet.
                  </div>
                )}
                {trip?.itinerary?.map((day) => (
                  <ItineraryDay key={day.id} day={day} isEditing={isEditing} />
                ))}
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
