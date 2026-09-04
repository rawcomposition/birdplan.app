import SelectDropdown from "components/SelectDropdown";
import useHotspotLists from "hooks/useHotspotLists";

export const ALL_LISTS = "all";

type Props = {
  listId: string;
  onListChange: (listId: string) => void;
};

export default function ExploreToolbar({ listId, onListChange }: Props) {
  const { lists } = useHotspotLists();

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
      />
    </div>
  );
}
