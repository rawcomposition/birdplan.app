import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Field from "components/Field";
import Input from "components/Input";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { randomId } from "lib/helpers";
import { MarkerIcon } from "lib/types";

type Props = {
  lat: number;
  lng: number;
};

export default function AddMarker({ lat, lng }: Props) {
  const [name, setName] = React.useState("");
  const { close } = useModal();
  const { appendMarker } = useTrip();

  const handleAddMarker = () => {
    appendMarker({ lat, lng, name, icon: MarkerIcon.HOUSE, id: randomId(6) });
    close();
  };

  return (
    <>
      <Header>Add Custom Marker</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <div className="flex flex-col gap-5 w-full">
            <Field label="Name">
              <Input type="text" name="name" value={name} onChange={(e: any) => setName(e.target.value)} />
            </Field>
            <Button type="button" color="primary" className="mt-2" size="sm" onClick={handleAddMarker}>
              Add Marker
            </Button>
          </div>
        </div>
      </Body>
    </>
  );
}
