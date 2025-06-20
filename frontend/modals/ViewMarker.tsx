import React from "react";
import { Header, Body } from "providers/modals";
import { CustomMarker } from "@birdplan/shared";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import MarkerWithIcon from "components/MarkerWithIcon";
import DirectionsButton from "components/DirectionsButton";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import Icon from "components/Icon";
import { getGooglePlaceUrl } from "lib/helpers";
import useTripMutation from "hooks/useTripMutation";
import { MarkerIconT } from "lib/icons";

type Props = {
  marker: CustomMarker;
};

export default function ViewMarker({ marker }: Props) {
  const { close } = useModal();
  const { trip, canEdit, setSelectedMarkerId } = useTrip();
  const { id, placeId, name, lat, lng } = marker;

  const removeMutation = useTripMutation({
    url: `/trips/${trip?._id}/markers/${id}`,
    method: "DELETE",
    updateCache: (old) => ({
      ...old,
      markers: old.markers.filter((it) => it.id !== id),
    }),
  });

  const saveNotesMutation = useTripMutation<{ notes: string }>({
    url: `/trips/${trip?._id}/markers/${id}/notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      markers: old.markers.map((it) => (it.id === id ? { ...it, notes: input.notes } : it)),
    }),
  });

  const handleRemoveMarker = () => {
    if (!confirm("Are you sure you want to remove this marker?")) return;
    removeMutation.mutate({});
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
        <MarkerWithIcon icon={marker.icon as MarkerIconT} className="-mb-2 mr-2 -ml-1" />
        {name}
      </Header>
      <Body className="relative min-h-[200px]" noPadding>
        <div className="px-4 sm:px-6 pt-4">
          <div className="flex gap-2 mb-2">
            <DirectionsButton lat={lat} lng={lng} markerId={id} googleUrl={googleUrl} />
            <Menu as="div" className="relative inline-block text-left z-10">
              <Menu.Button className="text-[14px] rounded text-gray-600 bg-gray-100 px-2 py-[10px] inline-flex items-center">
                <Icon name="verticalDots" />
              </Menu.Button>
              <Menu.Items className="absolute text-sm left-0 top-10 rounded bg-white shadow-lg py-1.5 w-[180px] ring-1 ring-black ring-opacity-5 flex flex-col">
                <Menu.Item>
                  <a
                    href={googleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-700 hover:bg-gray-50 px-3 py-2"
                  >
                    View on Google Maps
                  </a>
                </Menu.Item>
                {canEdit && (
                  <Menu.Item>
                    <button
                      type="button"
                      onClick={handleRemoveMarker}
                      className="inline-flex items-center gap-1 w-full text-red-700 px-3 py-2 hover:bg-gray-50"
                    >
                      Remove from trip
                    </button>
                  </Menu.Item>
                )}
              </Menu.Items>
            </Menu>
          </div>
          <InputNotes value={marker.notes} onBlur={(value) => saveNotesMutation.mutate({ notes: value })} key={id} />
        </div>
      </Body>
    </>
  );
}
