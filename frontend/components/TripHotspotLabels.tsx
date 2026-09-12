import { HotspotLabelsInput, LabelInput } from "@birdplan/shared";
import LabelPicker from "components/LabelPicker";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import useCreateTripLabel from "hooks/useCreateTripLabel";
import { useModal } from "stores/modals";
import { nanoId } from "lib/helpers";

type Props = {
  hotspotId: string;
  className?: string;
};

export default function TripHotspotLabels({ hotspotId, className }: Props) {
  const { trip, canEdit } = useTrip();
  const { stack } = useModal();
  const labels = trip?.labels || [];
  const selectedIds = trip?.hotspots.find((it) => it.id === hotspotId)?.labelIds || [];

  const labelsMutation = useTripMutation<HotspotLabelsInput>({
    url: `/trips/${trip?._id}/hotspots/${hotspotId}/labels`,
    method: "PUT",
    updateCache: (old, input) => ({
      ...old,
      hotspots: old.hotspots.map((it) => (it.id === hotspotId ? { ...it, labelIds: input.labelIds } : it)),
    }),
  });

  const createLabel = useCreateTripLabel();

  const setLabelIds = (labelIds: string[]) => labelsMutation.mutate({ labelIds });

  const toggle = (labelId: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(labelId);
    else next.delete(labelId);
    setLabelIds([...next]);
  };

  const handleNewLabel = async (input: LabelInput) => {
    const _id = nanoId();
    await createLabel.mutateAsync({ _id, ...input });
    setLabelIds([...selectedIds, _id]);
  };

  if (!canEdit && selectedIds.length === 0) return null;

  return (
    <LabelPicker
      labels={labels}
      selectedIds={selectedIds}
      onToggle={toggle}
      onNewLabel={handleNewLabel}
      onManage={() => stack("manageTripLabels")}
      disabled={!canEdit}
      className={className}
    />
  );
}
