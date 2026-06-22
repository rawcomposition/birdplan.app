import { useTrip } from "providers/trip";
import Icon from "components/Icon";
import { formatTime, formatDistance } from "lib/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import clsx from "clsx";
import useTripMutation from "hooks/useTripMutation";

type Props = {
  isEditing: boolean;
  dayId: string;
  id: string;
  isLoading: boolean;
};

export default function TravelTime({ isEditing, dayId, id, isLoading }: Props) {
  const { trip } = useTrip();
  const locations = trip?.itinerary?.find((day) => day.id === dayId)?.locations || [];
  const thisLocationIndex = locations.findIndex((it) => it.id === id);
  const location1 = locations[thisLocationIndex - 1];
  const location2 = locations[thisLocationIndex]; // current location
  const travelData = location2?.travel;

  const removeTravelTimeMutation = useTripMutation<{ id: string }>({
    url: `/trips/${trip?._id}/itinerary/${dayId}/remove-travel-time`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary:
        old.itinerary?.map((it) =>
          it.id === dayId
            ? {
                ...it,
                locations: it.locations?.map((loc) =>
                  loc.id === input.id
                    ? { ...loc, travel: loc.travel ? { ...loc.travel, isDeleted: true } : undefined }
                    : loc
                ),
              }
            : it
        ) || [],
    }),
  });

  const calcTravelTimeMutation = useTripMutation<{ id: string; method: string }>({
    url: `/trips/${trip?._id}/itinerary/${dayId}/calc-travel-time`,
    mutationKey: [`/trips/${trip?._id}/itinerary/${dayId}/calc-travel-time`],
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      itinerary: old.itinerary?.map((it) =>
        it.id === dayId
          ? {
              ...it,
              locations: it.locations?.map((loc) => (loc.id === input.id ? { ...loc, travel: undefined } : loc)),
            }
          : it
      ),
    }),
  });

  const marker1 =
    trip?.hotspots?.find((h) => h.id === location1?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location1?.locationId || "");

  const marker2 =
    trip?.hotspots?.find((h) => h.id === location2?.locationId || "") ||
    trip?.markers?.find((m) => m.id === location2?.locationId || "");

  const TravelInfo = travelData && (
    <span className="flex items-center gap-2">
      {travelData.method === "walking" ? (
        <Icon name="walking" className="text-gray-400" />
      ) : travelData.method === "driving" ? (
        <Icon name="car" className="text-gray-400" />
      ) : (
        <Icon name="cycling" className="text-gray-400" />
      )}
      <span className="font-medium">{formatTime(travelData.time)}</span>•
      <span className="text-gray-500 text-xs">{formatDistance(travelData.distance, false)}</span>
    </span>
  );

  return (
    <div className="flex items-center gap-6 group">
      <div
        className={clsx(
          "border-l border-gray-300 border-dashed border-[1.1px] ml-4",
          isEditing || travelData ? "h-10" : "h-4"
        )}
      />

      {isEditing ? (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={clsx(
                "relative cursor-pointer text-xs text-gray-500",
                !!travelData?.isDeleted && "hover:text-gray-700 hover:underline"
              )}
            >
              {isLoading && !travelData ? (
                <>loading...</>
              ) : !travelData || !!travelData?.isDeleted ? (
                <>Calculate travel time</>
              ) : (
                !travelData?.isDeleted && TravelInfo
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[130px]">
              <DropdownMenuItem onClick={() => calcTravelTimeMutation.mutate({ id, method: "walking" })}>
                <Icon name="walking" /> Walk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => calcTravelTimeMutation.mutate({ id, method: "driving" })}>
                <Icon name="car" /> Drive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => calcTravelTimeMutation.mutate({ id, method: "cycling" })}>
                <Icon name="cycling" /> Bike
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {travelData && !travelData?.isDeleted && (
            <button
              type="button"
              onClick={() => removeTravelTimeMutation.mutate({ id })}
              className="text-[16px] p-1 -mt-1.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="xMarkBold" />
            </button>
          )}
        </div>
      ) : (
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${marker1?.lat},${marker1?.lng}&destination=${marker2?.lat},${marker2?.lng}&travelmode=${travelData?.method}`}
          target="_blank"
        >
          {!travelData?.isDeleted && <div className="text-gray-500 text-xs relative">{TravelInfo}</div>}
        </a>
      )}
    </div>
  );
}
