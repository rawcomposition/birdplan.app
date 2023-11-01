import React from "react";
import Bullseye from "icons/Bullseye";
import CloseButton from "components/CloseButton";
import { useTrip } from "providers/trip";

type Props = {
  name: string;
  code: string;
};

export default function Trip({ name, code }: Props) {
  const { targets, setSelectedSpeciesCode, trip } = useTrip();
  const isTarget = targets?.items?.findIndex((it) => it.code === code) !== -1;

  return (
    <div className="-mt-[4rem] bg-white p-4 w-full max-w-md z-10 shadow">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold inline-flex gap-1.5 items-center">
          {isTarget && <Bullseye className="text-[#c2410d] text-sm" />}
          {name}
        </h2>
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
