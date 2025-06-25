import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Field from "components/Field";
import Input from "components/Input";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { nanoId } from "lib/helpers";
import { MarkerIconT, markerIcons } from "lib/icons";
import MarkerWithIcon from "components/MarkerWithIcon";
import clsx from "clsx";
import toast from "react-hot-toast";
import useTripMutation from "hooks/useTripMutation";
import { CustomMarker, MarkerUpdateInput } from "@birdplan/shared";
import DirectionsButton from "components/DirectionsButton";
import InputNotes from "components/InputNotes";
import { Menu } from "@headlessui/react";
import Icon from "components/Icon";
import { getGooglePlaceUrl } from "lib/helpers";
import Error from "components/Error";

type Props = {
  markerId?: string;
  lat?: number;
  lng?: number;
};

export default function Marker({ markerId, lat: defaultLat, lng: defaultLng }: Props) {
  const { close } = useModal();
  const { trip, canEdit, setSelectedMarkerId, refetch } = useTrip();

  const marker = markerId ? trip?.markers?.find((m) => m.id === markerId) : undefined;
  const isEditing = !!marker;
  const [isEditMode, setIsEditMode] = React.useState(!isEditing);
  const [icon, setIcon] = React.useState<MarkerIconT>((marker?.icon as MarkerIconT) || undefined);
  const [name, setName] = React.useState(marker?.name || "");
  const [lat, setLat] = React.useState<number>(marker?.lat || defaultLat || 0);
  const [lng, setLng] = React.useState<number>(marker?.lng || defaultLng || 0);

  const addMarkerMutation = useTripMutation<CustomMarker>({
    url: `/trips/${trip?._id}/markers`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      markers: [...(old.markers || []), input],
    }),
  });

  const updateMarkerMutation = useTripMutation<MarkerUpdateInput>({
    url: `/trips/${trip?._id}/markers/${marker?.id}`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      markers: old.markers.map((it) =>
        it.id === marker?.id ? { ...it, name: input.name, lat: input.lat, lng: input.lng, icon: input.icon } : it
      ),
    }),
  });

  const removeMutation = useTripMutation({
    url: `/trips/${trip?._id}/markers/${marker?.id}`,
    method: "DELETE",
    updateCache: (old) => ({
      ...old,
      markers: old.markers.filter((it) => it.id !== marker?.id),
    }),
  });

  const saveNotesMutation = useTripMutation<{ notes: string }>({
    url: `/trips/${trip?._id}/markers/${marker?.id}/notes`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      markers: old.markers.map((it) => (it.id === marker?.id ? { ...it, notes: input.notes } : it)),
    }),
  });

  const handleSave = () => {
    if (!icon) return toast.error("Please choose an icon");

    if (isEditing) {
      updateMarkerMutation.mutate({ name, lat, lng, icon });
      setIsEditMode(false);
    } else {
      addMarkerMutation.mutate({ lat, lng, name, icon, id: nanoId(6) });
      close();
    }
  };

  const handleCancel = () => {
    if (isEditing && marker) {
      setIcon(marker.icon as MarkerIconT);
      setName(marker.name);
      setLat(marker.lat);
      setLng(marker.lng);
      setIsEditMode(false);
    } else {
      close();
    }
  };

  const handleRemoveMarker = () => {
    if (!confirm("Are you sure you want to remove this marker?")) return;
    removeMutation.mutate({});
    close();
  };

  React.useEffect(() => {
    if (markerId) {
      setSelectedMarkerId(markerId);
      return () => setSelectedMarkerId(undefined);
    }
  }, [markerId, setSelectedMarkerId]);

  const googleUrl = marker && getGooglePlaceUrl(marker.lat, marker.lng, marker.placeId);

  if (markerId && !marker) {
    return (
      <>
        <Header>Marker Not Found</Header>
        <Body>
          <Error message="The marker you're trying to view could not be found." onReload={refetch} />
        </Body>
      </>
    );
  }

  if (isEditing && !isEditMode) {
    return (
      <>
        <Header>
          <MarkerWithIcon icon={marker.icon as MarkerIconT} className="-mb-2 mr-2 -ml-1" />
          {marker.name}
        </Header>
        <Body className="relative min-h-[200px]" noPadding>
          <div className="px-4 sm:px-6 pt-4">
            <div className="flex gap-2 mb-2">
              <DirectionsButton lat={marker.lat} lng={marker.lng} markerId={marker.id} googleUrl={googleUrl} />
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
                    <>
                      <Menu.Item>
                        <button
                          type="button"
                          onClick={() => setIsEditMode(true)}
                          className="inline-flex items-center gap-1 w-full text-gray-700 px-3 py-2 hover:bg-gray-50"
                        >
                          Edit Marker
                        </button>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          type="button"
                          onClick={handleRemoveMarker}
                          className="inline-flex items-center gap-1 w-full text-red-700 px-3 py-2 hover:bg-gray-50"
                        >
                          Remove from trip
                        </button>
                      </Menu.Item>
                    </>
                  )}
                </Menu.Items>
              </Menu>
            </div>
            <InputNotes
              value={marker.notes}
              onBlur={(value) => saveNotesMutation.mutate({ notes: value })}
              key={marker.id}
            />
          </div>
        </Body>
      </>
    );
  }

  return (
    <>
      <Header>{isEditing ? "Edit Marker" : "Add Custom Marker"}</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <div className="flex flex-col gap-5 w-full">
            <Field label="Name">
              <Input
                type="text"
                name="name"
                value={name}
                autoFocus
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
            </Field>
            <div className="flex gap-2">
              <Field label="Latitude">
                <Input
                  type="string"
                  name="lat"
                  value={lat || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    if (value.includes(",")) {
                      const [lat, lng] = value.split(",");
                      setLat(Number(lat));
                      setLng(Number(lng));
                    } else {
                      setLat(Number(e.target.value));
                    }
                  }}
                />
              </Field>
              <Field label="Longitude">
                <Input
                  type="string"
                  name="lng"
                  value={lng || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLng(Number(e.target.value))}
                />
              </Field>
            </div>
            <div>
              <label>Choose icon</label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(markerIcons).map((it) => (
                  <button
                    type="button"
                    key={it}
                    onClick={() => setIcon(it as MarkerIconT)}
                    className={clsx("border-2 p-1", icon === it ? "border-blue-500 rounded-md" : "border-transparent")}
                  >
                    <MarkerWithIcon icon={it as MarkerIconT} className="scale-125" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" color="primary" size="md" onClick={handleSave}>
                {isEditing ? "Save Changes" : "Add Marker"}
              </Button>
              <Button type="button" color="gray" size="md" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Body>
    </>
  );
}
