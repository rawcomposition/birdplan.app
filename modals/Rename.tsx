import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Field from "components/Field";
import Input from "components/Input";
import { Trip } from "lib/types";
import { renameTrip } from "lib/firebase";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";

type Props = {
  trip: Trip;
};

export default function Rename({ trip }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const { close } = useModal();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    // @ts-ignore
    const name = form.name.value;
    if (!name) return toast.error("Please enter a name");

    try {
      setSubmitting(true);
      await renameTrip(trip.id, name);
      close();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update trip");
    }
    setSubmitting(false);
  };

  return (
    <>
      <Header>Rename</Header>
      <Body>
        <div className="flex gap-2 mb-2">
          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            <Field label="Name">
              <Input type="text" name="name" autoFocus defaultValue={trip.name} />
            </Field>

            <Button type="submit" color="primary" className="mt-2" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </div>
      </Body>
    </>
  );
}
