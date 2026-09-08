import React from "react";
import { LABEL_COLORS, LabelColor, LabelInput } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";
import { useModal } from "stores/modals";

type Props = {
  title: string;
  defaultValue?: LabelInput;
  submitLabel?: string;
  onSubmit: (input: LabelInput) => void;
};

export default function LabelForm({ title, defaultValue, submitLabel = "Create", onSubmit }: Props) {
  const { close } = useModal();
  const [name, setName] = React.useState(defaultValue?.name || "");
  const [color, setColor] = React.useState<LabelColor | undefined>(defaultValue?.color);
  const trimmed = name.trim();
  const canSubmit = !!trimmed && !!color;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ name: trimmed, color });
        close();
      }}
    >
      <Header>{title}</Header>
      <Body className="flex flex-col gap-4">
        <Field label="Name">
          <Input
            autoFocus
            value={name}
            placeholder="e.g. Guide required"
            maxLength={50}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Color">
          <div className="grid grid-cols-6 gap-2 pb-1">
            {LABEL_COLORS.map((it) => (
              <button
                key={it}
                type="button"
                aria-label={it}
                aria-pressed={color === it}
                onClick={() => setColor(it)}
                className={cn(
                  "h-8 rounded-md transition-all",
                  labelColorClasses[it].swatch,
                  color === it ? "ring-2 ring-offset-2 ring-gray-900" : "hover:opacity-80",
                )}
              />
            ))}
          </div>
        </Field>
      </Body>
      <Footer>
        <Button type="button" variant="outline" onClick={close}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </Footer>
    </form>
  );
}
