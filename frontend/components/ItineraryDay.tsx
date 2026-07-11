import React from "react";
import { Button, buttonVariants } from "components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "components/ui/card";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "components/ui/combobox";
import { useTrip } from "hooks/useTrip";
import dayjs from "dayjs";
import { useModal } from "stores/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import TravelTime from "components/TravelTime";
import InputNotesSimple from "components/InputNotesSimple";
import Icon from "components/Icon";
import { GripVertical, Plus, X } from "lucide-react";
import useTripMutation from "hooks/useTripMutation";
import { useMutationState } from "@tanstack/react-query";
import { Day } from "@birdplan/shared";
import { nanoId } from "lib/helpers";
import { MarkerIconT } from "lib/icons";
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
  dayIds: string[];
};

const densify = (itinerary: Day[] | undefined, dayIds: string[]): Day[] => {
  const existing = itinerary || [];
  const length = Math.max(existing.length, dayIds.length);
  return Array.from({ length }, (_, i) => existing[i] || { id: dayIds[i], locations: [] });
};

export default function ItineraryDay({ day, dayIndex, isEditing, dayIds }: PropsT) {
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

  const setNotesMutation = useTripMutation<{ notes: string; dayIds: string[] }, { itinerary: Day[] }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/set-notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: densify(old.itinerary, input.dayIds).map((it) =>
        it.id === day.id ? { ...it, notes: input.notes } : it
      ),
    }),
    reconcile: (old, response) => ({ ...old, itinerary: response.itinerary }),
  });

  const addLocationMutation = useTripMutation<
    { type: "hotspot" | "marker"; locationId: string; id: string; dayIds: string[] },
    { itinerary: Day[] }
  >({
    url: `/trips/${trip?._id}/itinerary/${day.id}/add-location`,
    method: "POST",
    mutationKey: [`/trips/${trip?._id}/itinerary/${day.id}/add-location`],
    updateCache: (old, input) => ({
      ...old,
      itinerary: densify(old.itinerary, input.dayIds).map((it) =>
        it.id === day.id
          ? {
              ...it,
              locations: [...(it.locations || []), { type: input.type, locationId: input.locationId, id: input.id }],
            }
          : it
      ),
    }),
    reconcile: (old, response) => ({ ...old, itinerary: response.itinerary }),
  });

  const serverLocations = day.locations || [];

  const [order, setOrder] = React.useState<string[] | null>(null);

  const orderValid =
    !!order && order.length === serverLocations.length && serverLocations.every((loc) => order.includes(loc.id));
  const locations = orderValid ? order!.map((id) => serverLocations.find((loc) => loc.id === id)!) : serverLocations;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = locations.map((it) => it.id);
    const newIds = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    setOrder(newIds);
    reorderMutation.mutate({ ids: newIds });
  };

  const isLoading =
    reorderMutation.isPending ||
    removeLocationMutation.isPending ||
    isCalculatingTravelTime ||
    isAddingLocation ||
    isFetchingTrip;

  const isStructuralPending = isAddingLocation || removeLocationMutation.isPending;
  const dragDisabled = !isEditing || isStructuralPending;

  const date = trip?.startDate ? dayjs(trip.startDate).add(dayIndex, "day").format("dddd, MMMM D") : "";
  const { notes } = day;

  const [addOpen, setAddOpen] = React.useState(false);
  const [addQuery, setAddQuery] = React.useState("");

  const addedIds = new Set((locations || []).map((it) => it.locationId));
  const addOptions: AddOption[] = [
    ...(trip?.markers
      .filter((it) => !addedIds.has(it.id))
      .map((m) => ({ id: m.id, name: m.name, type: "marker" as const, icon: m.icon as MarkerIconT })) ?? []),
    ...(trip?.hotspots
      .filter((it) => !addedIds.has(it.id))
      .map((h) => ({ id: h.id, name: h.name, type: "hotspot" as const, icon: "hotspot" as const })) ?? []),
  ];

  return (
    <Card className="mb-6 print:break-inside-avoid print:shadow-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Day {dayIndex + 1}</CardTitle>
        {date && <CardDescription>{date}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-3">
        <InputNotesSimple
          value={notes}
          onBlur={(value) => setNotesMutation.mutate({ notes: value, dayIds })}
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
              disabled={dragDisabled}
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
                      <SortableLocationRow id={id} disabled={dragDisabled}>
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
                                className="self-center print:hidden"
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
          <Combobox<AddOption>
            items={addOptions}
            itemToStringLabel={(option) => option.name}
            autoHighlight
            value={null}
            open={addOpen}
            onOpenChange={(next) => {
              setAddOpen(next);
              if (!next) setAddQuery("");
            }}
            inputValue={addQuery}
            onInputValueChange={setAddQuery}
            onValueChange={(option) => {
              if (!option) return;
              addLocationMutation.mutate({ type: option.type, locationId: option.id, id: nanoId(6), dayIds });
              setAddOpen(false);
            }}
          >
            <ComboboxTrigger className={cn(buttonVariants({ variant: "secondary", size: "xs" }), "mt-3")}>
              <Plus className="size-3.5" />
              Add Location
            </ComboboxTrigger>
            <ComboboxContent className="w-96">
              <ComboboxInput placeholder="Add a hotspot or marker..." />
              <ComboboxList>
                {(option: AddOption) => (
                  <ComboboxItem key={option.id} value={option}>
                    <MarkerWithIcon showStroke={false} icon={option.icon} className="inline-block shrink-0 scale-75" />
                    <span className="truncate">{option.name}</span>
                  </ComboboxItem>
                )}
              </ComboboxList>
              <ComboboxEmpty>No locations to add</ComboboxEmpty>
            </ComboboxContent>
          </Combobox>
        )}
      </CardContent>
    </Card>
  );
}

type AddOption = {
  id: string;
  name: string;
  type: "hotspot" | "marker";
  icon: MarkerIconT | "hotspot";
};

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
    animateLayoutChanges: () => false,
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
