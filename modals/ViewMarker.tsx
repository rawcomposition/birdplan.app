import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import { CustomMarker } from "lib/types";
import { useTrip } from "providers/trip";
import Trash from "icons/Trash";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import DirectionsButton from "components/DirectionsButton";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import VerticalDots from "icons/VerticalDots";

type Props = {
  marker: CustomMarker;
};

export default function ViewMarker({ marker }: Props) {
  const { close } = useModal();
  const { canEdit, removeMarker, saveMarkerNotes } = useTrip();
  const { id, name, lat, lng } = marker;

  const handleRemoveMarker = () => {
    if (!confirm("Are you sure you want to delete this marker?")) return;
    removeMarker(id);
    close();
  };

  return (
    <>
      <Header>
        <MarkerWithIcon icon={marker.icon} className="-mb-2 mr-2 -ml-1" />
        {name}
      </Header>
      <Body className="relative min-h-[200px]">
        <div className="flex gap-2 mb-2">
          <DirectionsButton lat={lat} lng={lng} markerId={id} />
          {canEdit && (
            <Button color="gray" size="sm" onClick={handleRemoveMarker}>
              <Trash className="mr-1 -mt-[3px] text-red-700" /> Delete
            </Button>
          )}
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
              <VerticalDots />
            </Menu.Button>
            <Menu.Items className="absolute text-sm -right-2 top-10 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-1">
              <Menu.Item>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600"
                >
                  View on Google Maps
                </a>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
        <InputNotes value={marker.notes} onBlur={(value) => saveMarkerNotes(id, value)} key={id} />
      </Body>
    </>
  );
}
