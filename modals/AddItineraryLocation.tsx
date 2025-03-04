import React from "react";
import { Header, Body } from "providers/modals";
import { useTrip } from "providers/trip";
import MarkerWithIcon from "components/MarkerWithIcon";
import { useModal } from "providers/modals";
import { LocationType } from "lib/types";
import { defaultMarkerIcon } from "lib/icons";

type Props = {
  dayId: string;
};

export default function AddItineraryLocation({ dayId }: Props) {
  const { close } = useModal();
  const { trip, locations, addItineraryDayLocation } = useTrip();

  const markers = locations.filter((it) => it.type === LocationType.custom);
  const hotspots = locations.filter((it) => it.type === LocationType.hotspot);

  return (
    <>
      <Header>Add Location</Header>
      <Body>
        {!!locations?.length ? (
          <ul className="flex flex-col space-y-1">
            {markers.map((marker) => (
              <li key={marker._id}>
                <button
                  className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 w-full"
                  onClick={() => {
                    addItineraryDayLocation(dayId, "marker", marker._id);
                    close();
                  }}
                >
                  <MarkerWithIcon
                    showStroke={false}
                    icon={marker.icon || defaultMarkerIcon}
                    className="inline-block scale-75 flex-shrink-0"
                  />
                  <span className="truncate">{marker.name}</span>
                </button>
              </li>
            ))}
            {hotspots.map((hotspot) => (
              <li key={hotspot._id}>
                <button
                  className="flex items-center gap-2 text-sm cursor-pointer py-0.5 text-gray-700 w-full"
                  onClick={() => {
                    addItineraryDayLocation(dayId, "hotspot", hotspot._id);
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
