import React from "react";
import { CustomMarker } from "lib/types";

export default function CustomMarkerRow({ name, id, ...props }: CustomMarker) {
  return (
    <li
      className={"flex items-center gap-2 text-sm text-gray-200 cursor-pointer"}
      title="Click to show on map"
      onClick={console.log}
      {...props}
    >
      <span className="truncate">{name}</span>
      <span className="text-gray-500 ml-auto text-xs"></span>
    </li>
  );
}
