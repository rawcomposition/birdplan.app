import React from "react";
import { Dialog, DialogContent, DialogTitle } from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";

type Props = {
  open: boolean;
  title: string;
  defaultValue?: string;
  submitLabel?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
};

export default function HotspotListDialog({
  open,
  title,
  defaultValue = "",
  submitLabel = "Create",
  onSubmit,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex flex-col gap-0 overflow-hidden rounded-2xl p-0 w-[calc(100%-2rem)] max-w-[400px] sm:max-w-[400px]">
        {open && (
          <ListNameForm
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

function ListNameForm({ title, defaultValue, submitLabel, onSubmit, onClose }: Omit<Props, "open">) {
  const [name, setName] = React.useState(defaultValue || "");
  const trimmed = name.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) onSubmit(trimmed);
      }}
    >
      <DialogTitle className="pl-6 sm:pl-7 pr-14 pt-7 text-xl font-bold tracking-tight text-gray-900">
        {title}
      </DialogTitle>
      <div className="px-6 sm:px-7 pt-4">
        <Field label="Name">
          <Input
            autoFocus
            value={name}
            placeholder="e.g. Costa Rica 2027"
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
      </div>
      <footer className="flex items-center justify-end gap-2 px-6 sm:px-7 pt-5 pb-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!trimmed}>
          {submitLabel}
        </Button>
      </footer>
    </form>
  );
}
