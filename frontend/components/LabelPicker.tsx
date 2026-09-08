import React from "react";
import { LabelInput, TripLabel } from "@birdplan/shared";
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
import { useModal } from "stores/modals";
import { cn } from "lib/utils";

type Props = {
  labels: TripLabel[];
  selectedIds: string[];
  onToggle: (labelId: string, checked: boolean) => void;
  onNewLabel: (input: LabelInput) => void;
  onManage: () => void;
  disabled?: boolean;
  className?: string;
};

export default function LabelPicker({ labels, selectedIds, onToggle, onNewLabel, onManage, disabled, className }: Props) {
  const { stack } = useModal();
  const selected = labels.filter((it) => selectedIds.includes(it._id));

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
          {!disabled && (
            <span className={buttonVariants({ variant: "outline-white", size: "xs", className: "h-6 px-2 text-[13px]" })}>
              <Plus className="size-3.5" />
              {selected.length === 0 && "Add label"}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[220px]">
          {labels.length > 0 && (
            <>
              <LabelPickerItems labels={labels} selectedIds={selectedIds} onToggle={onToggle} />
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => stack("labelForm", { title: "New label", onSubmit: onNewLabel })}>
            <Plus />
            New label
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onManage}>
            <Pencil />
            Manage labels
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
