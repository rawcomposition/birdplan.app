import React from "react";
import { BFHotspot } from "lib/types";
import Link from "next/link";

type Props = BFHotspot & {
  index: number;
};

export default function Targets({ locationId, name, percent, sampleSize, index }: Props) {
  return (
    <div key={locationId} className="border-t py-4 text-gray-500/80 text-[13px] pl-4 grid gap-2 sm:grid-cols-5">
      <div className="col-span-3 pt-1">
        <span>{index + 1}.</span>
        <Link
          href={`https://ebird.org/hotspot/${locationId}`}
          className="text-blue-900 font-bold text-base ml-3"
          target="_blank"
        >
          {name}
        </Link>
      </div>
      <div className="flex flex-col gap-1 w-full col-span-2">
        <div>
          <span className="text-gray-600 text-[17px] font-bold">{percent > 1 ? Math.round(percent) : percent}%</span>{" "}
          <span className="text-[13px]">of {sampleSize} checklists</span>
        </div>
        <div className="w-full bg-gray-200">
          <div className="h-2 bg-[#dd4b39]" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
