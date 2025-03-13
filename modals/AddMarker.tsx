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
import { CustomMarker } from "lib/types";

type Props = {
  lat?: number;
  lng?: number;
};

export default function AddMarker({ lat: defaultLat, lng: defaultLng }: Props) {
  const [icon, setIcon] = React.useState<MarkerIconT>();
  const [name, setName] = React.useState("");
  const [lat, setLat] = React.useState<number>(defaultLat || 0);
  const [lng, setLng] = React.useState<number>(defaultLng || 0);
  const { close } = useModal();
  const { trip } = useTrip();

  const addMarkerMutation = useTripMutation<CustomMarker>({
    url: `/api/trips/${trip?._id}/markers`,
    method: "POST",
    updateCache: (old, input) => ({
      ...old,
      markers: [...(old.markers || []), input],
    }),
  });

  const handleAddMarker = () => {
    if (!icon) return toast.error("Please choose an icon");
    addMarkerMutation.mutate({ lat, lng, name, icon, id: nanoId(6) });
    close();
  };

  return (
    <>
      <Header>Add Custom Marker</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <div className="flex flex-col gap-5 w-full">
            <Field label="Name">
              <Input type="text" name="name" value={name} autoFocus onChange={(e: any) => setName(e.target.value)} />
            </Field>
            <div className="flex gap-2">
              <Field label="Latitude">
                <Input
                  type="string"
                  name="lat"
                  value={lat || ""}
                  onChange={(e: any) => {
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
                  onChange={(e: any) => setLng(Number(e.target.value))}
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
                    onClick={() => setIcon(it)}
                    className={clsx("border-2 p-1", icon === it ? "border-blue-500 rounded-md" : "border-transparent")}
                  >
                    <MarkerWithIcon icon={it} className="scale-125" />
                  </button>
                ))}
              </div>
            </div>
            <Button type="button" color="primary" className="mt-2" size="md" onClick={handleAddMarker}>
              Add Marker
            </Button>
          </div>
        </div>
      </Body>
    </>
  );
}
