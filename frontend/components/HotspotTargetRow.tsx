import React from "react";
import FavButton from "components/FavButton";
import FrequencyBar from "components/FrequencyBar";
import MutualBadge from "components/MutualBadge";
import SpeciesThumb from "components/SpeciesThumb";
import { useSpeciesImages } from "hooks/useSpeciesImages";
import { formatFrequency } from "lib/helpers";

type Props = {
  code: string;
  name: string;
  frequency: number;
  index: number;
  hotspotId: string;
  range: string;
  isSaved: boolean;
  isMutual?: boolean;
  onClick: () => void;
};

export default function HotspotTargetRow({
  code,
  name,
  frequency,
  hotspotId,
  range,
  isSaved,
  isMutual,
  onClick,
}: Props) {
  const { getSpeciesImg } = useSpeciesImages();
  return (
    <div className="[&+&]:border-t [&+&]:border-gray-100 py-3 text-[13px] mx-1 flex gap-3 items-center">
      <SpeciesThumb img={getSpeciesImg(code)} name={name} className="w-16 shrink-0" />
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
          {isMutual && <MutualBadge variant="icon" />}
          {isSaved && (
            <span className="[&_button]:text-xs! flex items-center">
              <FavButton hotspotId={hotspotId} code={code} name={name} range={range} percent={frequency} />
            </span>
          )}
          <span className="text-gray-600 text-[13px] font-medium ml-auto shrink-0">{formatFrequency(frequency)}%</span>
        </div>
        <FrequencyBar percent={frequency} />
      </div>
    </div>
  );
}
