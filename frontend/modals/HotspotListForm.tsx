import React from "react";
import { Header, Body, Footer } from "components/Modal";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import { useModal } from "stores/modals";

type Props = {
  title: string;
  defaultValue?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
};

export default function HotspotListForm({ title, defaultValue = "", submitLabel = "Create", onSubmit }: Props) {
  const { close } = useModal();
  const [name, setName] = React.useState(defaultValue);
  const trimmed = name.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!trimmed) return;
        onSubmit(trimmed);
        close();
      }}
    >
      <Header>{title}</Header>
      <Body>
        <Field label="Name">
          <Input
            autoFocus
            value={name}
            placeholder="e.g. Costa Rica 2027"
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
      </Body>
      <Footer>
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" disabled={!trimmed}>
          {submitLabel}
        </Button>
      </Footer>
    </form>
  );
}
