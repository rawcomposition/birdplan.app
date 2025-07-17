import React from "react";
import Icon from "components/Icon";
import CloseButton from "components/CloseButton";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";

type Props = {
  name: string;
  code: string;
};

export default function Trip({ name, code }: Props) {
  const { modalId } = useModal();
  const { targets, setSelectedSpecies, trip } = useTrip();
  const isTarget = targets?.items?.findIndex((it) => it.code === code) !== -1;

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modalId) {
        setSelectedSpecies(undefined);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalId]);

  return (
    <div className="sm:absolute sm:mt-0 sm:-translate-x-1/2 sm:rounded-b-lg sm:left-1/2 bg-white p-4 w-full sm:max-w-md z-10 shadow">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold inline-flex gap-1.5 items-center">
          {isTarget && <Icon name="bullseye" className="text-[#c2410d] text-sm" />}
          {name}
        </h2>
        <CloseButton onClick={() => setSelectedSpecies(undefined)} className="ml-auto" />
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
