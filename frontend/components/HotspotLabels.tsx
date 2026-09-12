import { LabelCreateInput, LabelInput, SavedHotspotLabelsInput } from "@birdplan/shared";
import LabelPicker from "components/LabelPicker";
import useLabels from "hooks/useLabels";
import useLabelMutation from "hooks/useLabelMutation";
import useSavedHotspots from "hooks/useSavedHotspots";
import useSavedHotspotMutation from "hooks/useSavedHotspotMutation";
import { useModal } from "stores/modals";
import { nanoId } from "lib/helpers";

type Props = {
  hotspotId: string;
  name: string;
  lat: number;
  lng: number;
  disabled?: boolean;
  className?: string;
};

export default function HotspotLabels({ hotspotId, name, lat, lng, disabled, className }: Props) {
  const { labels } = useLabels();
  const { savedHotspots } = useSavedHotspots();
  const { stack } = useModal();

  const saved = savedHotspots.find((it) => it.hotspotId === hotspotId);
  const selectedIds = saved?.labelIds || [];

  const labelsMutation = useSavedHotspotMutation<SavedHotspotLabelsInput>({
    url: `/saved-hotspots/${hotspotId}/labels`,
    method: "PUT",
    updateCache: (old, input) => {
      const row = old.find((it) => it.hotspotId === hotspotId);
      if (!row) {
        if (input.labelIds.length === 0) return old;
        return [
          {
            _id: hotspotId,
            userId: "",
            hotspotId,
            name: input.name || "",
            lat: input.lat ?? 0,
            lng: input.lng ?? 0,
            listIds: [],
            labelIds: input.labelIds,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...old,
        ];
      }
      if (input.labelIds.length === 0 && row.listIds.length === 0) {
        return old.filter((it) => it.hotspotId !== hotspotId);
      }
      return old.map((it) => (it.hotspotId === hotspotId ? { ...it, labelIds: input.labelIds } : it));
    },
  });

  const createLabel = useLabelMutation<LabelCreateInput>({
    url: "/labels",
    method: "POST",
    updateCache: (old, input) => [...old, { userId: "", createdAt: new Date(), ...input }],
  });

  const setLabelIds = (labelIds: string[]) => labelsMutation.mutate({ labelIds, name, lat, lng });

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

  return (
    <LabelPicker
      labels={labels}
      selectedIds={selectedIds}
      onToggle={toggle}
      onNewLabel={handleNewLabel}
      onManage={() => stack("manageLabels")}
      disabled={disabled}
      className={className}
    />
  );
}
