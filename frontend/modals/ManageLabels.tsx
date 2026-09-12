import { LabelCreateInput } from "@birdplan/shared";
import LabelManager from "components/LabelManager";
import useLabels from "hooks/useLabels";
import useLabelMutation from "hooks/useLabelMutation";
import { nanoId } from "lib/helpers";

export default function ManageLabels() {
  const { labels } = useLabels();

  const createLabel = useLabelMutation<LabelCreateInput>({
    url: "/labels",
    method: "POST",
    updateCache: (old, input) => [...old, { userId: "", createdAt: new Date(), ...input }],
  });

  const updateLabel = useLabelMutation<LabelCreateInput>({
    url: (input) => `/labels/${input._id}`,
    method: "PATCH",
    updateCache: (old, input) => old.map((it) => (it._id === input._id ? { ...it, ...input } : it)),
  });

  const deleteLabel = useLabelMutation<{ _id: string }>({
    url: (input) => `/labels/${input._id}`,
    method: "DELETE",
    updateCache: (old, input) => old.filter((it) => it._id !== input._id),
    updateSavedCache: (old, input) =>
      old
        .map((it) => ({ ...it, labelIds: it.labelIds.filter((id) => id !== input._id) }))
        .filter((it) => it.listIds.length > 0 || it.labelIds.length > 0),
  });

  return (
    <LabelManager
      labels={labels}
      onCreate={(input) => createLabel.mutate({ _id: nanoId(), ...input })}
      onUpdate={(label, input) => updateLabel.mutate({ _id: label._id, ...input })}
      onDelete={(label) => deleteLabel.mutate({ _id: label._id })}
    />
  );
}
