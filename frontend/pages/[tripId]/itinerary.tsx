import React from "react";
import Header from "components/Header";
import Heading from "components/Heading";
import TripNav from "components/TripNav";
import { useUser } from "hooks/useUser";
import ErrorBoundary from "components/ErrorBoundary";
import { Button } from "components/ui/button";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import Icon from "components/Icon";
import NotFound from "components/NotFound";
import useTripMutation from "hooks/useTripMutation";
import { nanoId } from "lib/helpers";
import ItineraryDay from "components/ItineraryDay";

export default function Itinerary() {
  const { user } = useUser();
  const { is404, trip, canEdit } = useTrip();
  const { close, modalId } = useModal();
  const hasStartDate = !!trip?.startDate;
  const shouldDefaultEdit = !!(trip && !trip?.startDate) || !!(trip && !trip?.itinerary?.length);
  const [editing, setEditing] = React.useState(shouldDefaultEdit);
  const [prevShouldDefaultEdit, setPrevShouldDefaultEdit] = React.useState(shouldDefaultEdit);
  const isEditing = canEdit && editing;

  if (shouldDefaultEdit !== prevShouldDefaultEdit) {
    setPrevShouldDefaultEdit(shouldDefaultEdit);
    if (shouldDefaultEdit) setEditing(true);
  }

  const addDayMutation = useTripMutation<{ id: string; locations: any[] }>({
    url: `/trips/${trip?._id}/itinerary`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      itinerary: [...(old.itinerary || []), input],
    }),
  });

  const handleAddDay = () => {
    addDayMutation.mutate({ id: nanoId(6), locations: [] });
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    const isButton = (e.target as HTMLElement).closest("button");
    if (isButton) return;
    if (modalId) close();
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      {trip && (
          <title>{`${trip.name} | BirdPlan.app`}</title>
      )}

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: user?._id ? "/trips" : "/" }} />
      <TripNav active="itinerary" />
      <main className="flex h-[calc(100%-60px-55px)]">
        <ErrorBoundary>
          <div className="h-full grow flex sm:relative flex-col w-full">
            <div className="h-full overflow-auto" onClick={handleDivClick}>
              <div className="mt-2 sm:mt-8 max-w-2xl w-full mx-auto p-4 md:p-0">
                <div className="mb-8 sm:mb-10">
                  <div className="flex justify-between items-center">
                    <Heading title="Trip Itinerary" />
                    {canEdit && hasStartDate && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-4 flex items-center gap-2 print:hidden"
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
                </div>

                {canEdit && !trip?.startDate && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Set your trip dates</h2>
                    <p className="text-gray-600 mb-4">
                      Add a start date in trip settings to build your day-by-day itinerary.
                    </p>
                    <Button href={`/${trip?._id}/settings`} variant="default">
                      Go to Trip Settings
                    </Button>
                  </div>
                )}
                {!canEdit && !trip?.startDate && (
                  <div className="pt-4 p-5 bg-white rounded-lg shadow-sm mb-8">
                    No itinerary has been set for this trip yet.
                  </div>
                )}
                {trip?.itinerary?.map((day, index) => <ItineraryDay key={day.id} day={day} dayIndex={index} isEditing={isEditing} />)}
                {isEditing && hasStartDate && (
                  <Button variant="default" onClick={handleAddDay} className="mb-8">
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
