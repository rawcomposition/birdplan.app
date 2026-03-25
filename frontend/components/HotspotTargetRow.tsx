import React from "react";
import FavButton from "components/FavButton";
import { useSpeciesImages } from "providers/species-images";

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
  const { getSpeciesImg } = useSpeciesImages();
  const img = React.useMemo(() => getSpeciesImg(code), [code, getSpeciesImg]);

  return (
    <div className="[&+&]:border-t [&+&]:border-gray-100 py-3 text-[13px] mx-1 flex gap-3 items-center">
      {img ? (
        <img
          src={img.url}
          alt={name}
          className="w-16 aspect-[4/3] rounded object-cover flex-shrink-0"
          loading="lazy"
          title={img.by ? `Photo by ${img.by}` : ""}
        />
      ) : (
        <div className="w-16 aspect-[4/3] rounded bg-gray-200 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="text-left hover:underline text-gray-900 text-sm truncate"
            onClick={onClick}
            title="Click to view recent reports"
          >
            {name}
          </button>
          {isSaved && (
            <span className="[&_button]:!text-xs flex items-center">
              <FavButton hotspotId={hotspotId} code={code} name={name} range={range} percent={frequency} />
            </span>
          )}
          <span className="text-gray-600 text-[13px] font-medium ml-auto flex-shrink-0">
            {frequency > 1 ? Math.round(frequency) : frequency}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full">
          <div className="h-[5px] bg-emerald-600/90 rounded-full" style={{ width: `${frequency}%` }} />
        </div>
      </div>
    </div>
  );
}
