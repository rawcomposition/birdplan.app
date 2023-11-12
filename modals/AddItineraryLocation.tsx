import React from "react";
import { Header, Body } from "providers/modals";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import { MarkerIcon } from "lib/types";
import { useModal } from "providers/modals";

type Props = {
  dayId: string;
};

export default function AddItineraryLocation({ dayId }: Props) {
  const { close } = useModal();
  const { trip, addItineraryDayLocation } = useTrip();

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
                    addItineraryDayLocation(dayId, "marker", marker.id);
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
                    addItineraryDayLocation(dayId, "hotspot", hotspot.id);
                    close();
                  }}
                >
                  <MarkerWithIcon
                    showStroke={false}
                    icon={MarkerIcon.HOTSPOT}
                    className="inline-block scale-75 flex-shrink-0"
                  />
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
