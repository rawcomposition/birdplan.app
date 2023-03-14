import React from "react";
import { EbirdHotspot } from "lib/types";
import { useModal } from "providers/modals";
import { getMarkerShade } from "lib/helpers";
import { useProfile } from "providers/profile";

type Props = {
  hotspots: EbirdHotspot[];
};

export default function HotspotList() {
  const { hotspots } = useProfile();
  const { open } = useModal();
  return (
    <ul className="space-y-2">
      {hotspots.map((it) => (
        <li
          key={it.locId}
          className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer"
          onClick={() => open("hotspot", { hotspot: it })}
        >
          <img src={`/markers/hotspot-${getMarkerShade(it.numSpeciesAllTime) || 1}.svg`} className="w-3" alt="marker" />
          <span className="truncate">{it.locName}</span>
        </li>
      ))}
    </ul>
  );
}
