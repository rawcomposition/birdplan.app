import React from "react";
import { useModal } from "providers/modals";
import { getMarkerColor } from "lib/helpers";
import { useProfile } from "providers/profile";
import Marker from "icons/Marker";

export default function HotspotList() {
  const { hotspots } = useProfile();
  const { open } = useModal();
  return (
    <ul className="space-y-2">
      {hotspots.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer"
          onClick={() => open("hotspot", { hotspot: it })}
        >
          <Marker className="w-3 shrink-0" color={getMarkerColor(it.species)} />
          <span className="truncate">{it.name}</span>
        </li>
      ))}
    </ul>
  );
}
