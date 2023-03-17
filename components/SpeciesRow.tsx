import React from "react";
import Circle from "icons/Circle";
import CircleFilled from "icons/CircleFilled";
import clsx from "clsx";
import { useTrip } from "providers/trip";

type Props = {
  name: string;
  code: string;
  [key: string]: any;
};

export default function SpeciesRow({ name, code, ...props }: Props) {
  const { selectedSpeciesCode, setSelectedSpeciesCode } = useTrip();
  const selected = selectedSpeciesCode === code;

  return (
    <li
      className={clsx("flex items-center gap-2 text-sm text-gray-200 py-1.5", !selected && "cursor-pointer")}
      title="Click to show on map"
      onClick={!selected ? () => setSelectedSpeciesCode(code) : undefined}
      {...props}
    >
      {selected ? <CircleFilled className="text-xs text-sky-600" /> : <Circle className="text-xs text-gray-700" />}
      <span className="truncate">{name}</span>
      {selected && (
        <button
          type="button"
          className="text-xs text-gray-500 ml-auto"
          onClick={() => setSelectedSpeciesCode(undefined)}
        >
          Clear
        </button>
      )}
    </li>
  );
}
