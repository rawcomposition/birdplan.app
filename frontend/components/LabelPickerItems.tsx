import React from "react";
import { Label } from "@birdplan/shared";
import { Search } from "lucide-react";
import { DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuLabel } from "components/ui/dropdown-menu";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";

const SEARCH_THRESHOLD = 8;

type Props = {
  labels: Label[];
  selectedIds: string[];
  onToggle: (labelId: string, checked: boolean) => void;
  title?: string;
};

export default function LabelPickerItems({ labels, selectedIds, onToggle, title = "Labels" }: Props) {
  const [search, setSearch] = React.useState("");
  const query = search.trim().toLowerCase();
  const visible = query ? labels.filter((it) => it.name.toLowerCase().includes(query)) : labels;

  return (
    <DropdownMenuGroup>
      {labels.length > SEARCH_THRESHOLD ? (
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b">
          <Search className="size-3.5 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Filter labels…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      ) : (
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
      )}
      <div className="max-h-[260px] overflow-y-auto">
        {visible.map((label) => (
          <DropdownMenuCheckboxItem
            key={label._id}
            checked={selectedIds.includes(label._id)}
            closeOnClick={false}
            disabled={label._id.startsWith("new-")}
            onCheckedChange={(checked) => onToggle(label._id, checked)}
          >
            <span className={cn("size-3 rounded-full shrink-0", labelColorClasses[label.color].swatch)} />
            <span className="truncate">{label.name}</span>
          </DropdownMenuCheckboxItem>
        ))}
        {visible.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching labels</div>}
      </div>
    </DropdownMenuGroup>
  );
}
