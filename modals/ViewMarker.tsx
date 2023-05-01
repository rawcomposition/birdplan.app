import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Directions from "icons/Directions";
import { CustomMarker } from "lib/types";
import { useTrip } from "providers/trip";
import Trash from "icons/Trash";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import DirectionsButton from "components/DirectionsButton";

type Props = {
  marker: CustomMarker;
};

export default function ViewMarker({ marker }: Props) {
  const { close } = useModal();
  const { removeMarker } = useTrip();
  const { id, name, lat, lng } = marker;

  const handleRemoveMarker = () => {
    if (!confirm("Are you sure you want to delete this marker?")) return;
    removeMarker(id);
    close();
  };

  return (
    <>
      <Header>
        <MarkerWithIcon offset={false} icon={marker.icon} className="inline-block scale-90 -mb-2 mr-2 -ml-1" />
        {name}
      </Header>
      <Body className="relative min-h-[200px]">
        <div className="flex gap-2 mb-2">
          <DirectionsButton lat={lat} lng={lng} markerId={id} />
          <Button color="gray" size="sm" onClick={handleRemoveMarker}>
            <Trash className="mr-1 -mt-[3px] text-red-700" /> Delete
          </Button>
        </div>
      </Body>
    </>
  );
}
