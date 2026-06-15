import React from "react";
import { Trip } from "@birdplan/shared";
import LifelistModeChooser from "components/LifelistModeChooser";
import useLifelistMode from "hooks/useLifelistMode";

type Props = {
  trip: Trip;
  mode: ReturnType<typeof useLifelistMode>;
  embedded?: boolean;
};

export default function LifelistEditor({ trip, mode, embedded }: Props) {
  return (
    <>
      {!embedded && (
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          Choose which life list to use for determining your trip targets.
        </p>
      )}
      <LifelistModeChooser trip={trip} canEdit mode={mode} />
    </>
  );
}
