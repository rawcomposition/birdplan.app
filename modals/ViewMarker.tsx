import React from "react";
import { Header, Body } from "providers/modals";
import { CustomMarker } from "lib/types";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import DirectionsButton from "components/DirectionsButton";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import Icon from "components/Icon";
import { getGooglePlaceUrl } from "lib/helpers";

type Props = {
  marker: CustomMarker;
};

export default function ViewMarker({ marker }: Props) {
  const { close } = useModal();
  const { canEdit, removeMarker, saveMarkerNotes, setSelectedMarkerId } = useTrip();
  const { id, placeId, name, lat, lng } = marker;

  const handleRemoveMarker = () => {
    if (!confirm("Are you sure you want to delete this marker?")) return;
    removeMarker(id);
    close();
  };

  React.useEffect(() => {
    setSelectedMarkerId(id);
    return () => setSelectedMarkerId(undefined);
  }, [id]);

  const googleUrl = getGooglePlaceUrl(lat, lng, placeId);

  return (
    <>
      <Header>
        <MarkerWithIcon icon={marker.icon} className="-mb-2 mr-2 -ml-1" />
        {name}
      </Header>
      <Body className="relative min-h-[200px]" noPadding>
        <div className="px-4 sm:px-6 pt-4">
          <div className="flex gap-2 mb-2">
            <DirectionsButton lat={lat} lng={lng} markerId={id} googleUrl={googleUrl} />
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
                <Icon name="verticalDots" />
              </Menu.Button>
              <Menu.Items className="absolute text-sm -right-2 top-10 rounded bg-white shadow-lg px-4 py-2 w-[170px] ring-1 ring-black ring-opacity-5 flex flex-col gap-2">
                <Menu.Item>
                  <a href={googleUrl} target="_blank" rel="noreferrer" className="text-sky-600">
                    View on Google Maps
                  </a>
                </Menu.Item>
                {canEdit && (
                  <Menu.Item>
                    <button
                      type="button"
                      onClick={handleRemoveMarker}
                      className="inline-flex items-center gap-1 text-red-700"
                    >
                      Remove from trip
                    </button>
                  </Menu.Item>
                )}
              </Menu.Items>
            </Menu>
          </div>
          <InputNotes value={marker.notes} onBlur={(value) => saveMarkerNotes(id, value)} key={id} />
        </div>
      </Body>
    </>
  );
}
