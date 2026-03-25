import React from "react";
import FavButton from "components/FavButton";

type Props = {
  code: string;
  name: string;
  frequency: number;
  index: number;
  hotspotId: string;
  range: string;
  isSaved: boolean;
  onClick: () => void;
};

export default function HotspotTargetRow({ code, name, frequency, index, hotspotId, range, isSaved, onClick }: Props) {
  return (
    <div className="border-t border-gray-100 py-1.5 text-gray-500/80 text-[13px] grid gap-2 grid-cols-1 sm:grid-cols-5 mx-1">
      <div className="sm:col-span-3 pt-2">
        <span className="mr-2">{index + 1}.</span>
        <button
          type="button"
          className="text-left hover:underline text-gray-900 text-sm ml-3"
          onClick={onClick}
          title="Click to view recent reports"
        >
          {name}
        </button>
      </div>
      <div className="flex gap-5 sm:col-span-2">
        {isSaved && (
          <FavButton hotspotId={hotspotId} code={code} name={name} range={range} percent={frequency} />
        )}
        <div className="flex flex-col gap-1 w-full col-span-2">
          <div>
            <span className="text-gray-600 text-[15px] font-bold">
              {frequency > 1 ? Math.round(frequency) : frequency}%
            </span>{" "}
          </div>
          <div className="w-full bg-gray-200">
            <div className="h-2 bg-[#1c6900]" style={{ width: `${frequency}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
