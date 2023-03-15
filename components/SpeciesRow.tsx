import React from "react";
import Circle from "icons/Circle";
import CircleFilled from "icons/CircleFilled";
import clsx from "clsx";

type Props = {
  name: string;
  selected: boolean;
  [key: string]: any;
};

export default function SpeciesRow({ name, selected, ...props }: Props) {
  return (
    <li
      className={clsx("flex items-center gap-2 text-sm text-gray-200 py-1.5", !selected && "cursor-pointer")}
      {...props}
    >
      {selected ? <CircleFilled className="text-xs text-sky-600" /> : <Circle className="text-xs text-gray-700" />}
      <span className="truncate">{name}</span>
    </li>
  );
}
