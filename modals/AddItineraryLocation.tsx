import React from "react";
import { Header, Body } from "providers/modals";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import { useModal } from "providers/modals";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { nanoId } from "lib/helpers";

type Props = {
  dayId: string;
};

export default function AddItineraryLocation({ dayId }: Props) {
  const { close } = useModal();
  const { trip, setTripCache } = useTrip();
  const queryClient = useQueryClient();

  const addDayMutation = useMutation({
    url: `/api/trips/${trip?._id}/itinerary/${dayId}/add-location`,
    method: "POST",
    mutationKey: [`/api/trips/${trip?._id}/itinerary/${dayId}/add-location`],
    onMutate: (data: any) =>
      setTripCache((old) => ({
        ...old,
        itinerary:
          old.itinerary?.map((it) => (it.id === dayId ? { ...it, locations: [...(it.locations || []), data] } : it)) ||
          [],
      })),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });

  return (
    <>
      <Header>Add Location</Header>
      <Body>
        {!!trip?.hotspots?.length || !!trip?.markers?.length ? (
          <ul className="flex flex-col space-y-1">
            {trip?.markers.map((marker) => (
              <li key={marker.id}>
                <button
                  className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 w-full"
                  onClick={() => {
                    addDayMutation.mutate({ type: "marker", locationId: marker.id, id: nanoId(6) });
                    close();
                  }}
                >
                  <MarkerWithIcon
                    showStroke={false}
                    icon={marker.icon}
                    className="inline-block scale-75 flex-shrink-0"
                  />
                  <span className="truncate">{marker.name}</span>
                </button>
              </li>
            ))}
            {trip?.hotspots.map((hotspot) => (
              <li key={hotspot.id}>
                <button
                  className="flex items-center gap-2 text-sm cursor-pointer py-0.5 text-gray-700 w-full"
                  onClick={() => {
                    addDayMutation.mutate({ type: "hotspot", locationId: hotspot.id, id: nanoId(6) });
                    close();
                  }}
                >
                  <MarkerWithIcon showStroke={false} icon="hotspot" className="inline-block scale-75 flex-shrink-0" />
                  <span className="truncate">{hotspot.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500">You have not saved any hotspots or custom markers yet.</div>
        )}
      </Body>
    </>
  );
}
