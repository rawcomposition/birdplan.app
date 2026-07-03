import React from "react";
import { Button } from "components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import { useTrip } from "hooks/useTrip";
import dayjs from "dayjs";
import { useModal } from "stores/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import TravelTime from "components/TravelTime";
import InputNotesSimple from "components/InputNotesSimple";
import Icon from "components/Icon";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import useTripMutation from "hooks/useTripMutation";
import { useMutationState } from "@tanstack/react-query";
import { Day } from "@birdplan/shared";
import { removeInvalidTravelData } from "lib/itinerary";
import { cn } from "lib/utils";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type PropsT = {
  day: Day;
  dayIndex: number;
  isEditing: boolean;
};

export default function ItineraryDay({ day, dayIndex, isEditing }: PropsT) {
  const { trip, isFetching: isFetchingTrip } = useTrip();
  const { open } = useModal();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
    updateCache: (old) => ({
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

  const reorderMutation = useTripMutation<{ ids: string[] }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/reorder-locations`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary:
        old.itinerary?.map((it) =>
          it.id === day.id
            ? {
                ...it,
                locations: removeInvalidTravelData(
                  input.ids.flatMap((id) => it.locations?.find((loc) => loc.id === id) || [])
                ),
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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = locations.map((it) => it.id);
    const newIds = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    reorderMutation.mutate({ ids: newIds });
  };

  const isLoading =
    reorderMutation.isPending ||
    removeLocationMutation.isPending ||
    removeDayMutation.isPending ||
    isCalculatingTravelTime ||
    isAddingLocation ||
    isFetchingTrip;

  const date = trip?.startDate ? dayjs(trip.startDate).add(dayIndex, "day").format("dddd, MMMM D") : "";
  const { notes, locations } = day;

  return (
    <Card className="mb-6 print:break-inside-avoid print:shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Day {dayIndex + 1}</CardTitle>
        {date && <CardDescription>{date}</CardDescription>}
        {isEditing && (
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove day"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleRemoveDay}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="pt-3">
        <InputNotesSimple
          value={notes}
          onBlur={(value) => setNotesMutation.mutate({ notes: value })}
          className={cn(!!locations?.length && "mb-4")}
          canEdit={isEditing}
        />
        {!!locations?.length && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={locations.map((it) => it.id)}
              strategy={verticalListSortingStrategy}
              disabled={!isEditing}
            >
              <ul className="flex flex-col">
                {locations.map(({ locationId, type, id }, index) => {
                  const location =
                    trip?.hotspots?.find((h) => h.id === locationId) || trip?.markers?.find((m) => m.id === locationId);

                  return (
                    <React.Fragment key={id}>
                      {index !== 0 && (
                        <li>
                          <TravelTime isLoading={isLoading} isEditing={isEditing} dayId={day.id} id={id} />
                        </li>
                      )}
                      <SortableLocationRow id={id} disabled={!isEditing}>
                        {({ handleProps, setActivatorNodeRef }) => (
                          <>
                            {isEditing && (
                              <button
                                type="button"
                                ref={setActivatorNodeRef}
                                aria-label="Drag to reorder"
                                className="touch-none cursor-grab self-center p-1 -ml-1 text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing print:hidden"
                                {...handleProps}
                              >
                                <GripVertical className="size-4" />
                              </button>
                            )}
                            <div
                              role="button"
                              tabIndex={location ? 0 : undefined}
                              aria-disabled={!location}
                              className={cn("flex gap-2 text-left py-1 grow min-w-0", location && "cursor-pointer")}
                              onClick={
                                location
                                  ? () =>
                                      type === "hotspot"
                                        ? open("hotspot", { hotspot: location })
                                        : open("viewMarker", { markerId: location.id })
                                  : undefined
                              }
                            >
                              {location ? (
                                <MarkerWithIcon
                                  showStroke={false}
                                  icon={(location as any)?.icon || "hotspot"}
                                  className="inline-block scale-[.85] shrink-0 print:hidden"
                                />
                              ) : (
                                <Icon name="warning" className="text-destructive text-[22px]" />
                              )}
                              <span className="min-w-0">
                                <span className="block truncate font-medium mt-[2px]">
                                  {location?.name || "Unknown Location"}
                                </span>
                                {location?.notes && (
                                  <span className="text-secondary-foreground text-sm relative whitespace-pre-wrap">
                                    {location.notes}
                                  </span>
                                )}
                              </span>
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Remove location"
                                className="self-center text-muted-foreground hover:text-destructive print:hidden"
                                onClick={() => removeLocationMutation.mutate({ id })}
                              >
                                <X className="size-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </SortableLocationRow>
                    </React.Fragment>
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        {isEditing && (
          <Button
            size="xs"
            variant="secondary"
            className={cn(!!locations?.length && "mt-3")}
            onClick={() => open("addItineraryLocation", { dayId: day.id })}
          >
            <Plus className="size-3.5" />
            Add Location
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

type RowRenderProps = {
  handleProps: Record<string, any>;
  setActivatorNodeRef: (el: HTMLElement | null) => void;
};

function SortableLocationRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (props: RowRenderProps) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2 text-sm text-foreground relative rounded-lg border bg-card p-3",
        isDragging && "relative z-10 shadow-md"
      )}
    >
      {children({ handleProps: { ...attributes, ...listeners }, setActivatorNodeRef })}
    </li>
  );
}
