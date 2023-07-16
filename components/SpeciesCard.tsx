import React from "react";
import Button from "components/Button";
import Bullseye from "icons/Bullseye";
import CloseButton from "components/CloseButton";
import { useTrip } from "providers/trip";

type Props = {
  name: string;
  code: string;
};

export default function Trip({ name, code }: Props) {
  const { targets, setSelectedSpeciesCode, removeTarget, trip } = useTrip();
  const isTarget = targets?.items?.findIndex((it) => it.code === code) !== -1;

  const handleRemoveTarget = () => {
    if (!confirm("Are you sure you want to remove this target? You can only add it back by re-importing your targets."))
      return;
    removeTarget(code);
    setSelectedSpeciesCode(undefined);
  };

  return (
    <div className="absolute top-0 left-1/2 bg-white px-4 py-3 -translate-x-1/2 rounded-b-lg w-full max-w-md z-10">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold inline-flex gap-1.5 items-center">
          {isTarget && <Bullseye className="text-[#c2410d] text-sm" />}
          {name}
        </h2>
        {isTarget && (
          <Button color="gray" size="xs" onClick={handleRemoveTarget}>
            Remove Target
          </Button>
        )}
        <CloseButton onClick={() => setSelectedSpeciesCode(undefined)} className="ml-auto" />
      </div>
      <p className="text-xs text-gray-500 mt-1.5">
        Showing reports over the last 30 days.{" "}
        <a
          href={`https://ebird.org/map/${code}?env.minX=${trip?.bounds?.minX}&env.minY=${trip?.bounds?.minY}&env.maxX=${trip?.bounds?.maxX}&env.maxY=${trip?.bounds?.maxY}`}
          className="text-sky-700"
          target="_blank"
        >
          View on eBird
        </a>
      </p>
    </div>
  );
}
