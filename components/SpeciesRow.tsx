import React from "react";
import Circle from "icons/Circle";
import CircleFilled from "icons/CircleFilled";
import clsx from "clsx";
import { useTrip } from "providers/trip";
import { useUI } from "providers/ui";

type Props = {
  name: string;
  code: string;
  percent?: number;
  [key: string]: any;
};

export default function SpeciesRow({ name, code, percent, ...props }: Props) {
  const { closeSidebar } = useUI();
  const { selectedSpeciesCode, setSelectedSpeciesCode } = useTrip();
  const selected = selectedSpeciesCode === code;

  const handleSelect = (code: string) => {
    setSelectedSpeciesCode(code);
    closeSidebar();
  };

  return (
    <li
      className={clsx("flex items-center gap-2 text-sm text-gray-200 py-1.5", !selected && "cursor-pointer")}
      title="Click to show on map"
      onClick={!selected ? () => handleSelect(code) : undefined}
      {...props}
    >
      {selected ? <CircleFilled className="text-xs text-[#ce0d02]/90" /> : <Circle className="text-xs text-gray-700" />}
      <span className="truncate">{name}</span>
      <span className="text-gray-500 ml-auto text-xs">
        {selected && (
          <button type="button" onClick={() => setSelectedSpeciesCode(undefined)} title="Reset map to hotspot view">
            Clear
          </button>
        )}
        {percent && selected && <span className="mx-1.5" />}
        {percent && <span>{percent}%</span>}
      </span>
    </li>
  );
}
