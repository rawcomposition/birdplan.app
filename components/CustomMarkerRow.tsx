import React from "react";
import { CustomMarker } from "lib/types";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";

export default function CustomMarkerRow(marker: CustomMarker) {
  const { name } = marker;
  const { open } = useModal();
  return (
    <li
      className={"flex items-center gap-2 text-sm cursor-pointer"}
      title="Click to show on map"
      onClick={() => open("viewMarker", { marker })}
    >
      <MarkerWithIcon showStroke={false} offset={false} icon={marker.icon} className="inline-block scale-[.65] -ml-1" />
      <span className="truncate">{name}</span>
      <span className="text-gray-500 ml-auto text-xs"></span>
    </li>
  );
}
