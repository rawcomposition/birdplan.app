import React from "react";
import { Label, LabelInput, SavedHotspotLabelsInput } from "@birdplan/shared";
import { Pencil, Plus } from "lucide-react";
import { buttonVariants } from "components/ui/button";
import LabelBadge from "components/LabelBadge";
import LabelPickerItems from "components/LabelPickerItems";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "components/ui/dropdown-menu";
import useLabels from "hooks/useLabels";
import useLabelMutation from "hooks/useLabelMutation";
import useSavedHotspots from "hooks/useSavedHotspots";
import useSavedHotspotMutation from "hooks/useSavedHotspotMutation";
import { useModal } from "stores/modals";
import { cn } from "lib/utils";

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
  const selected = labels.filter((it) => selectedIds.includes(it._id));

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

  const createLabel = useLabelMutation<LabelInput, Label>({
    url: "/labels",
    method: "POST",
    updateCache: (old, input) => [...old, { _id: `new-${Date.now()}`, userId: "", ...input, createdAt: new Date() }],
  });

  const setLabelIds = (labelIds: string[]) => labelsMutation.mutate({ labelIds, name, lat, lng });

  const toggle = (labelId: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(labelId);
    else next.delete(labelId);
    setLabelIds([...next]);
  };

  const handleNewLabel = async (input: LabelInput) => {
    const label = await createLabel.mutateAsync(input);
    if (label?._id) setLabelIds([...selectedIds, label._id]);
  };

  return (
    <div className={cn("flex", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={<div className="flex flex-wrap items-center gap-1.5 cursor-pointer disabled:cursor-default" />}
        >
          {selected.map((label) => (
            <LabelBadge key={label._id} label={label} />
          ))}
          <span className={buttonVariants({ variant: "outline-white", size: "xs", className: "h-6 px-2 text-[13px]" })}>
            <Plus className="size-3.5" />
            {selected.length === 0 && "Add label"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {labels.length > 0 && (
            <>
              <LabelPickerItems labels={labels} selectedIds={selectedIds} onToggle={toggle} />
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => stack("labelForm", { title: "New label", onSubmit: handleNewLabel })}>
            <Plus />
            New label
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => stack("manageLabels")}>
            <Pencil />
            Manage labels
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
