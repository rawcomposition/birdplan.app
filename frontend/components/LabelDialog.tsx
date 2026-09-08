import React from "react";
import { LABEL_COLORS, LabelColor, LabelInput } from "@birdplan/shared";
import { Dialog, DialogContent, DialogTitle } from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";

type Props = {
  open: boolean;
  title: string;
  defaultValue?: LabelInput;
  submitLabel?: string;
  onSubmit: (input: LabelInput) => void;
  onClose: () => void;
};

export default function LabelDialog({ open, title, defaultValue, submitLabel = "Create", onSubmit, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0 w-[calc(100%-2rem)] max-w-[400px] sm:max-w-[400px]">
        {open && (
          <LabelForm
            title={title}
            defaultValue={defaultValue}
            submitLabel={submitLabel}
            onSubmit={onSubmit}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LabelForm({ title, defaultValue, submitLabel, onSubmit, onClose }: Omit<Props, "open">) {
  const [name, setName] = React.useState(defaultValue?.name || "");
  const [color, setColor] = React.useState<LabelColor | undefined>(defaultValue?.color);
  const trimmed = name.trim();
  const canSubmit = !!trimmed && !!color;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onSubmit({ name: trimmed, color });
      }}
    >
      <DialogTitle className="pl-6 sm:pl-7 pr-14 pt-7 text-xl font-bold tracking-tight text-gray-900">
        {title}
      </DialogTitle>
      <div className="px-6 sm:px-7 pt-4 flex flex-col gap-4">
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
          <div className="grid grid-cols-6 gap-2">
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
      </div>
      <footer className="flex items-center justify-end gap-2 px-6 sm:px-7 pt-5 pb-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}
