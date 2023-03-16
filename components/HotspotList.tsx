import React from "react";
import { useModal } from "providers/modals";
import { getMarkerColor } from "lib/helpers";
import { useTrip } from "providers/trip";
import Marker from "icons/Marker";

export default function HotspotList() {
  const { trip } = useTrip();
  const { open } = useModal();
  return (
    <ul className="space-y-2">
      {trip?.hotspots.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer"
          onClick={() => open("hotspot", { hotspot: it })}
        >
          <Marker className="w-3 shrink-0" color={getMarkerColor(it.species || 0)} />
          <span className="truncate">{it.name}</span>
        </li>
      ))}
    </ul>
  );
}
