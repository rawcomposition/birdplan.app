import React from "react";
import { useModal } from "stores/modals";
import { HotspotListCreateInput, SavedHotspot } from "@birdplan/shared";
import { Button } from "components/ui/button";
import Icon from "components/Icon";
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
import { nanoId } from "lib/helpers";

type Props = {
  saved?: SavedHotspot;
  disabled?: boolean;
  onChange: (listIds: string[]) => void;
};

export default function SaveToListsMenu({ saved, disabled, onChange }: Props) {
  const { lists } = useHotspotLists();
  const selected = new Set(saved?.listIds || []);
  const isSaved = selected.size > 0;

  const createList = useHotspotListMutation<HotspotListCreateInput>({
    url: "/hotspot-lists",
    method: "POST",
    updateCache: (old, input) => [...old, { userId: "", createdAt: new Date(), ...input }],
  });

  const toggle = (listId: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(listId);
    else next.delete(listId);
    onChange([...next]);
  };

  const { stack } = useModal();
  const handleNewList = async (name: string) => {
    const _id = nanoId();
    await createList.mutateAsync({ _id, name });
    onChange([...selected, _id]);
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
          <DropdownMenuItem onClick={() => stack("hotspotListForm", { title: "New list", onSubmit: handleNewList })}>
            <Icon name="plus" className="text-xs" />
            New list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
