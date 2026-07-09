import React from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Heading from "components/Heading";
import { Button } from "components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import EmptyState from "components/EmptyState";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import Icon from "components/Icon";
import { Printer } from "lucide-react";
import useTripMutation from "hooks/useTripMutation";
import ItineraryDay from "components/ItineraryDay";

export default function Itinerary() {
  const { trip, canEdit } = useTrip();
  const { close, modalId } = useModal();
  const isDateRange = !!(trip?.startDate && trip?.endDate);
  const dayCount = isDateRange ? dayjs(trip!.endDate).diff(dayjs(trip!.startDate), "day") + 1 : 0;
  const persistedDays = trip?.itinerary || [];
  const renderDays = isDateRange
    ? Array.from({ length: dayCount }, (_, i) => persistedDays[i] || { id: `${trip!._id}-d${i}`, locations: [] })
    : persistedDays;
  const dayIds = renderDays.map((d) => d.id);
  const hasDays = renderDays.length > 0;
  const shouldDefaultEdit = !!(trip && !isDateRange) || !!(trip && !trip?.itinerary?.length);
  const [editing, setEditing] = React.useState(shouldDefaultEdit);
  const [prevShouldDefaultEdit, setPrevShouldDefaultEdit] = React.useState(shouldDefaultEdit);
  const [startDraft, setStartDraft] = React.useState("");
  const [endDraft, setEndDraft] = React.useState("");
  const isEditing = canEdit && editing;

  if (shouldDefaultEdit !== prevShouldDefaultEdit) {
    setPrevShouldDefaultEdit(shouldDefaultEdit);
    if (shouldDefaultEdit) setEditing(true);
  }

  const datesMutation = useTripMutation<{ startDate: string; endDate: string }>({
    url: `/trips/${trip?._id}/dates`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      startDate: input.startDate,
      endDate: input.endDate,
      startMonth: Number(input.startDate.slice(5, 7)),
      endMonth: Number(input.endDate.slice(5, 7)),
    }),
  });

  const handleSetDates = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDraft || !endDraft) return toast.error("Please choose start and end dates");
    if (endDraft < startDraft) return toast.error("End date must be on or after the start date");
    datesMutation.mutate({ startDate: startDraft, endDate: endDraft });
  };

  const handleDivClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!modalId) return;
    const isButton = (e.target as HTMLElement).closest("button");
    if (isButton) return;
    if (modalId) close();
  };

  const dateRange =
    trip?.startDate &&
    `${dayjs(trip.startDate).format("MMMM D")}${
      trip.endDate ? ` – ${dayjs(trip.endDate).format("MMMM D, YYYY")}` : `, ${dayjs(trip.startDate).format("YYYY")}`
    }`;

  return (
    <>
      {trip && <title>{`${trip.name} | BirdPlan.app`}</title>}
      <div className="h-full grow flex sm:relative flex-col w-full print:h-auto">
        <div className="h-full overflow-auto print:h-auto print:overflow-visible" onClick={handleDivClick}>
          <div className="mt-2 sm:mt-8 max-w-2xl w-full mx-auto p-4 md:p-0 print:mt-0 print:max-w-none">
            <div className="hidden print:block mb-6">
              <h1 className="text-2xl font-bold">{trip?.name}</h1>
              {dateRange && <p className="text-sm text-muted-foreground">{dateRange}</p>}
            </div>
            <div className="mb-8 sm:mb-10 print:hidden">
              <div className="flex justify-between items-center">
                <Heading title="Trip Itinerary" />
                <div className="flex items-center gap-2">
                  {hasDays && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                      <Printer className="size-4" />
                      <span className="hidden xs:inline">Print</span>
                    </Button>
                  )}
                  {canEdit && isDateRange && (
                    <Button variant="outline" size="sm" onClick={() => setEditing((prev) => !prev)}>
                      {isEditing ? <Icon name="check" /> : <Icon name="pencil" />}
                      <span>{isEditing ? "Done" : "Edit"}</span>
                    </Button>
                  )}
                </div>
              </div>
              {dateRange && <p className="text-sm text-muted-foreground mt-1.5">{dateRange}</p>}
            </div>

            {canEdit && !isDateRange && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Set your trip dates</CardTitle>
                  <CardDescription>
                    Your day-by-day itinerary is built from your travel dates. You can change them anytime in trip
                    settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSetDates}>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary-foreground">
                      Start date
                      <Input
                        type="date"
                        size="sm"
                        name="startDate"
                        value={startDraft}
                        onChange={(e) => setStartDraft(e.target.value)}
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary-foreground">
                      End date
                      <Input
                        type="date"
                        size="sm"
                        name="endDate"
                        value={endDraft}
                        onChange={(e) => setEndDraft(e.target.value)}
                        min={startDraft || undefined}
                        required
                      />
                    </label>
                    <Button type="submit" loading={datesMutation.isPending} loadingText="Saving...">
                      Save Dates
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {!canEdit && !hasDays && (
              <EmptyState
                title="No itinerary yet"
                description="The trip organizer hasn't planned any days for this trip."
                icon="calendar"
              />
            )}
            {renderDays.map((day, index) => (
              <ItineraryDay key={day.id} day={day} dayIndex={index} isEditing={isEditing} dayIds={dayIds} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
