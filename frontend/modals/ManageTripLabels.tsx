import { LabelCreateInput } from "@birdplan/shared";
import LabelManager from "components/LabelManager";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import useCreateTripLabel from "hooks/useCreateTripLabel";
import { nanoId } from "lib/helpers";

export default function ManageTripLabels() {
  const { trip } = useTrip();
  const labels = trip?.labels || [];

  const createLabel = useCreateTripLabel();

  const updateLabel = useTripMutation<LabelCreateInput>({
    url: (input) => `/trips/${trip?._id}/labels/${input._id}`,
    method: "PATCH",
    updateCache: (old, input) => ({
      ...old,
      labels: (old.labels || []).map((it) => (it._id === input._id ? { ...it, ...input } : it)),
    }),
  });

  const deleteLabel = useTripMutation<{ _id: string }>({
    url: (input) => `/trips/${trip?._id}/labels/${input._id}`,
    method: "DELETE",
    updateCache: (old, input) => ({
      ...old,
      labels: (old.labels || []).filter((it) => it._id !== input._id),
      hotspots: old.hotspots.map((it) => ({ ...it, labelIds: (it.labelIds || []).filter((id) => id !== input._id) })),
    }),
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
