import React from "react";
import { Label, LabelInput } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Pencil, Trash2 } from "lucide-react";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import LabelBadge from "components/LabelBadge";
import LabelDialog from "components/LabelDialog";
import useLabels from "hooks/useLabels";
import useLabelMutation from "hooks/useLabelMutation";

export default function ManageLabels() {
  const { close } = useModal();
  const { labels } = useLabels();
  const [isAdding, setIsAdding] = React.useState(false);

  const createLabel = useLabelMutation<LabelInput>({
    url: "/labels",
    method: "POST",
    updateCache: (old, input) => [...old, { _id: `new-${Date.now()}`, userId: "", ...input, createdAt: new Date() }],
  });

  return (
    <>
      <Header>Manage labels</Header>
      <Body className="min-h-0 pb-2">
        {labels.length === 0 && <p className="text-sm text-gray-500 py-2">No labels yet.</p>}
        <ul className="divide-y divide-border/60">
          {labels.map((label) => (
            <LabelRow key={label._id} label={label} />
          ))}
        </ul>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setIsAdding(true)}>
          <Icon name="plus" className="text-xs" />
          New label
        </Button>
      </Body>
      <Footer>
        <Button onClick={close}>Done</Button>
      </Footer>
      <LabelDialog
        open={isAdding}
        title="New label"
        onSubmit={(input) => {
          setIsAdding(false);
          createLabel.mutate(input);
        }}
        onClose={() => setIsAdding(false)}
      />
    </>
  );
}

function LabelRow({ label }: { label: Label }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const isPending = label._id.startsWith("new-");

  const updateLabel = useLabelMutation<LabelInput>({
    url: `/labels/${label._id}`,
    method: "PATCH",
    updateCache: (old, input) => old.map((it) => (it._id === label._id ? { ...it, ...input } : it)),
  });

  const deleteLabel = useLabelMutation<{}>({
    url: `/labels/${label._id}`,
    method: "DELETE",
    updateCache: (old) => old.filter((it) => it._id !== label._id),
    updateSavedCache: (old) =>
      old
        .map((it) => ({ ...it, labelIds: it.labelIds.filter((id) => id !== label._id) }))
        .filter((it) => it.listIds.length > 0 || it.labelIds.length > 0),
  });

  const handleDelete = () => {
    if (!confirm(`Delete "${label.name}"? It will be removed from all hotspots.`)) return;
    deleteLabel.mutate({});
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
        disabled={isPending}
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete label"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
      <LabelDialog
        open={isEditing}
        title="Edit label"
        submitLabel="Save"
        defaultValue={{ name: label.name, color: label.color }}
        onSubmit={(input) => {
          setIsEditing(false);
          if (input.name !== label.name || input.color !== label.color) updateLabel.mutate(input);
        }}
        onClose={() => setIsEditing(false)}
      />
    </li>
  );
}
