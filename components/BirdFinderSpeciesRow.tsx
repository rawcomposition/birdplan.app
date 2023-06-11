import React from "react";
import { BFTarget } from "lib/types";
import ArrowRight from "icons/ArrowRight";

type Props = BFTarget & {
  index: number;
  onSelect: (id: string, name: string) => void;
};

export default function BirdFinderSpeciesRow({ id, name, percent, index, onSelect }: Props) {
  return (
    <div key={id} className="border-t py-4 text-gray-500/80 text-[13px] pl-4 grid gap-2 grid-cols-1 sm:grid-cols-5">
      <div className="sm:col-span-3 pt-1">
        <span>{index + 1}.</span>
        <button type="button" className="text-blue-900 font-bold text-base ml-3" onClick={() => onSelect(id, name)}>
          {name}
        </button>
      </div>
      <div className="flex gap-6 sm:col-span-2">
        <div className="flex flex-col gap-1 w-full col-span-2">
          <div>
            <span className="text-gray-600 text-[17px] font-bold">{percent > 1 ? Math.round(percent) : percent}%</span>{" "}
          </div>
          <div className="w-full bg-gray-200">
            <div className="h-2 bg-[#dd4b39]" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <button className="ml-3 text-gray-500 whitespace-nowrap" type="button" onClick={() => onSelect(id, name)}>
          View <ArrowRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}
