import React from "react";
import Circle from "icons/Circle";
import CircleFilled from "icons/CircleFilled";
import clsx from "clsx";

type Props = {
  name: string;
  selected: boolean;
  onClear?: () => void;
  onClick?: () => void;
  [key: string]: any;
};

export default function SpeciesRow({ name, selected, onClick, onClear, ...props }: Props) {
  return (
    <li
      className={clsx("flex items-center gap-2 text-sm text-gray-200 py-1.5", !selected && "cursor-pointer")}
      title="Click to show on map"
      onClick={!selected ? onClick : undefined}
      {...props}
    >
      {selected ? <CircleFilled className="text-xs text-sky-600" /> : <Circle className="text-xs text-gray-700" />}
      <span className="truncate">{name}</span>
      {selected && (
        <button type="button" className="text-xs text-gray-500 ml-auto" onClick={onClear}>
          Clear
        </button>
      )}
    </li>
  );
}
