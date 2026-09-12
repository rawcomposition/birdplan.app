import { Pencil } from "lucide-react";
import SelectDropdown from "components/SelectDropdown";
import { DropdownMenuItem } from "components/ui/dropdown-menu";
import useHotspotLists from "hooks/useHotspotLists";
import { useModal } from "stores/modals";

export const ALL_LISTS = "all";

type Props = {
  listId: string;
  onListChange: (listId: string) => void;
};

export default function ExploreToolbar({ listId, onListChange }: Props) {
  const { lists } = useHotspotLists();
  const { open } = useModal();

  const options = [{ value: ALL_LISTS, label: "All saved" }, ...lists.map((it) => ({ value: it._id, label: it.name }))];

  return (
    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
      <SelectDropdown
        value={listId}
        onChange={onListChange}
        options={options}
        label="List"
        align="left"
        className="border-0 shadow-lg bg-white hover:bg-gray-100"
      >
        <DropdownMenuItem onClick={() => open("manageHotspotLists")}>
          <Pencil />
          Manage lists
        </DropdownMenuItem>
      </SelectDropdown>
    </div>
  );
}
