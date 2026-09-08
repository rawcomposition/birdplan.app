import { LabelInput, TripLabel } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Pencil, Trash2 } from "lucide-react";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import LabelBadge from "components/LabelBadge";

type Props = {
  labels: TripLabel[];
  onCreate: (input: LabelInput) => void;
  onUpdate: (label: TripLabel, input: LabelInput) => void;
  onDelete: (label: TripLabel) => void;
};

export default function LabelManager({ labels, onCreate, onUpdate, onDelete }: Props) {
  const { close, stack } = useModal();

  return (
    <>
      <Header>Manage labels</Header>
      <Body className="min-h-0 pb-2">
        {labels.length === 0 && <p className="text-sm text-muted-foreground py-2">No labels yet.</p>}
        <ul className="divide-y divide-border/60">
          {labels.map((label) => (
            <LabelRow key={label._id} label={label} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => stack("labelForm", { title: "New label", onSubmit: onCreate })}
        >
          <Icon name="plus" className="text-xs" />
          New label
        </Button>
      </Body>
      <Footer>
        <Button onClick={close}>Done</Button>
      </Footer>
    </>
  );
}

type RowProps = {
  label: TripLabel;
  onUpdate: (label: TripLabel, input: LabelInput) => void;
  onDelete: (label: TripLabel) => void;
};

function LabelRow({ label, onUpdate, onDelete }: RowProps) {
  const { stack } = useModal();

  const handleDelete = () => {
    if (!confirm(`Delete "${label.name}"? It will be removed from all hotspots.`)) return;
    onDelete(label);
  };

  return (
    <li className="flex items-center gap-1 py-2">
      <span className="grow min-w-0">
        <LabelBadge label={label} className="max-w-full" />
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        aria-label="Edit label"
        onClick={() =>
          stack("labelForm", {
            title: "Edit label",
            submitLabel: "Save",
            defaultValue: { name: label.name, color: label.color },
            onSubmit: (input: LabelInput) => {
              if (input.name !== label.name || input.color !== label.color) onUpdate(label, input);
            },
          })
        }
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete label"
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
