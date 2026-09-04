import React from "react";
import { HotspotList, HotspotListInput, SavedHotspot } from "@birdplan/shared";
import { Button } from "components/ui/button";
import Icon from "components/Icon";
import HotspotListDialog from "components/HotspotListDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "components/ui/dropdown-menu";
import useHotspotLists from "hooks/useHotspotLists";
import useHotspotListMutation from "hooks/useHotspotListMutation";

type Props = {
  saved?: SavedHotspot;
  disabled?: boolean;
  onChange: (listIds: string[]) => void;
};

export default function SaveToListsMenu({ saved, disabled, onChange }: Props) {
  const { lists } = useHotspotLists();
  const [isAdding, setIsAdding] = React.useState(false);
  const isSaved = !!saved;
  const selected = new Set(saved?.listIds || []);

  const createList = useHotspotListMutation<HotspotListInput, HotspotList>({
    url: "/hotspot-lists",
    method: "POST",
    updateCache: (old, input) => [
      ...old,
      {
        _id: `new-${Date.now()}`,
        userId: "",
        name: input.name,
        createdAt: new Date(),
      },
    ],
  });

  const toggle = (listId: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(listId);
    else next.delete(listId);
    onChange([...next]);
  };

  const handleNewList = async (name: string) => {
    setIsAdding(false);
    const list = await createList.mutateAsync({ name });
    if (list?._id) onChange([...selected, list._id]);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              variant="outline-white"
              size="sm"
              aria-pressed={isSaved}
              className={isSaved ? "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-50" : undefined}
            />
          }
        >
          <Icon name={isSaved ? "star" : "starOutline"} className={isSaved ? "text-yellow-500" : "text-gray-400"} />
          {isSaved ? "Saved" : "Save"}
          <Icon name="angleDown" className="text-xs opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[240px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Save to list</DropdownMenuLabel>
            {lists.map((list) => (
              <DropdownMenuCheckboxItem
                key={list._id}
                checked={selected.has(list._id)}
                closeOnClick={false}
                onCheckedChange={(checked) => toggle(list._id, checked)}
              >
                {list.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsAdding(true)}>
            <Icon name="plus" className="text-xs" />
            New list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <HotspotListDialog open={isAdding} title="New list" onSubmit={handleNewList} onClose={() => setIsAdding(false)} />
    </>
  );
}
