import React from "react";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { Hotspot } from "lib/types";

export default function HotspotList() {
  const { trip, setSelectedMarkerId } = useTrip();
  const { open } = useModal();

  const handleClick = (hotspot: Hotspot) => {
    setSelectedMarkerId(hotspot.id);
    open("hotspot", { hotspot, onDismiss: () => setSelectedMarkerId(undefined) });
  };

  return (
    <ul className="space-y-2">
      {trip?.hotspots.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer"
          onClick={() => handleClick(it)}
        >
          <span className="w-3 h-3 rounded-full bg-sky-600 shrink-0" />
          <span className="truncate">{it.name}</span>
        </li>
      ))}
    </ul>
  );
}
