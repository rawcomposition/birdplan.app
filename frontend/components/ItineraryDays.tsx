import { Day } from "@birdplan/shared";
import { Badge } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import dayjs from "dayjs";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import { nanoId } from "lib/helpers";
import { getTripDays } from "lib/itinerary";
import { cn } from "lib/utils";

type LocationType = "hotspot" | "marker";

type Props = {
  locationId: string;
  type: LocationType;
  className?: string;
};

export default function ItineraryDays({ locationId, type, className }: Props) {
  const { trip, canEdit } = useTrip();
  const days = getTripDays(trip);
  const dayIds = days.map((it) => it.id);
  const scheduledDays = days.flatMap((day, index) => {
    const entry = day.locations?.find((loc) => loc.locationId === locationId);
    return entry ? [{ day, dayIndex: index, entry }] : [];
  });

  if (!canEdit || !days.length) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-muted/50 px-3 py-2",
        className
      )}
    >
      {scheduledDays.map(({ day, dayIndex, entry }) => (
        <ScheduledDayChip key={day.id} day={day} dayIndex={dayIndex} entry={entry} />
      ))}
      {!scheduledDays.length && <span className="text-[13px] font-medium text-muted-foreground">No scheduled visits</span>}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon"
              aria-label={scheduledDays.length ? "Schedule another day" : "Schedule a visit"}
              className="ml-auto size-7 bg-green-700 shadow-xs hover:bg-green-800"
            >
              <Icon name="plus" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {days.map((day, index) => (
            <ItineraryDayToggle key={day.id} day={day} dayIndex={index} dayIds={dayIds} locationId={locationId} type={type} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const formatDayLabel = (startDate: string | undefined, dayIndex: number) =>
  startDate ? dayjs(startDate).add(dayIndex, "day").format("ddd, MMM D") : `Day ${dayIndex + 1}`;

type ScheduledDayChipProps = {
  day: Day;
  dayIndex: number;
  entry: NonNullable<Day["locations"]>[number];
};

function ScheduledDayChip({ day, dayIndex, entry }: ScheduledDayChipProps) {
  const { trip } = useTrip();
  const label = formatDayLabel(trip?.startDate, dayIndex);

  const removeMutation = useTripMutation<{ id: string }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/remove-location`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: getTripDays(old).map((it) =>
        it.id === day.id ? { ...it, locations: it.locations?.filter((loc) => loc.id !== input.id) || [] } : it
      ),
    }),
  });

  return (
    <Badge variant="outline" className="h-7 gap-1 bg-card pl-2.5 pr-1.5 font-semibold text-green-800">
      {label}
      <button
        type="button"
        aria-label={`Remove ${label}`}
        onClick={() => removeMutation.mutate({ id: entry.id })}
        disabled={removeMutation.isPending}
        className="flex size-5 shrink-0 items-center justify-center rounded-full text-green-800 transition-colors hover:bg-green-700/10 hover:text-green-950"
      >
        <Icon name="xMark" />
      </button>
    </Badge>
  );
}

type ItineraryDayToggleProps = {
  day: Day;
  dayIndex: number;
  dayIds: string[];
  locationId: string;
  type: LocationType;
};

function ItineraryDayToggle({ day, dayIndex, dayIds, locationId, type }: ItineraryDayToggleProps) {
  const { trip } = useTrip();
  const entry = day.locations?.find((loc) => loc.locationId === locationId);
  const date = trip?.startDate ? dayjs(trip.startDate).add(dayIndex, "day").format("ddd, MMM D") : "";

  const addMutation = useTripMutation<
    { type: LocationType; locationId: string; id: string; dayIds: string[] },
    { itinerary: Day[] }
  >({
    url: `/trips/${trip?._id}/itinerary/${day.id}/add-location`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      itinerary: getTripDays(old).map((it) =>
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

  const removeMutation = useTripMutation<{ id: string }>({
    url: `/trips/${trip?._id}/itinerary/${day.id}/remove-location`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: getTripDays(old).map((it) =>
        it.id === day.id ? { ...it, locations: it.locations?.filter((loc) => loc.id !== input.id) || [] } : it
      ),
    }),
  });

  const onCheckedChange = (checked: boolean) => {
    if (checked) {
      addMutation.mutate({ type, locationId, id: nanoId(6), dayIds });
    } else if (entry) {
      removeMutation.mutate({ id: entry.id });
    }
  };

  return (
    <DropdownMenuCheckboxItem
      checked={!!entry}
      onCheckedChange={onCheckedChange}
      closeOnClick
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <span className="truncate">
        Day {dayIndex + 1}
        {date && <span className="text-muted-foreground"> · {date}</span>}
      </span>
    </DropdownMenuCheckboxItem>
  );
}
