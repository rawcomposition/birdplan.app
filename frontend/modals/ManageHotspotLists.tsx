import React from "react";
import { HotspotList, HotspotListCreateInput } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Pencil, Trash2, MapPinPlus } from "lucide-react";
import OptionsMenu from "components/OptionsMenu";
import { DropdownMenuTrigger } from "components/ui/dropdown-menu";
import useSavedHotspots from "hooks/useSavedHotspots";
import { savedHotspotsInList, nanoId } from "lib/helpers";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import useHotspotLists from "hooks/useHotspotLists";
import useHotspotListMutation from "hooks/useHotspotListMutation";
import useHotspotListActions from "hooks/useHotspotListActions";

export default function ManageHotspotLists() {
  const { close } = useModal();
  const { lists } = useHotspotLists();
  const [newName, setNewName] = React.useState("");
  const trimmed = newName.trim();

  const createList = useHotspotListMutation<HotspotListCreateInput>({
    url: "/hotspot-lists",
    method: "POST",
    updateCache: (old, input) => [
      ...old,
      { userId: "", createdAt: new Date(), ...input },
    ],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    createList.mutate({ _id: nanoId(), name: trimmed });
    setNewName("");
  };

  return (
    <>
      <Header>Manage lists</Header>
      <Body className="min-h-0 pb-2">
        <ul className="divide-y divide-border/60">
          {lists.map((list) => (
            <ListRow key={list._id} list={list} />
          ))}
        </ul>
        <form onSubmit={handleCreate} className="flex items-center gap-2 pt-4">
          <Input
            size="sm"
            value={newName}
            placeholder="New list name"
            maxLength={100}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button type="submit" size="sm" variant="outline" disabled={!trimmed}>
            <Icon name="plus" className="text-xs" />
            Add
          </Button>
        </form>
      </Body>
      <Footer>
        <Button onClick={close}>Done</Button>
      </Footer>
    </>
  );
}

function ListRow({ list }: { list: HotspotList }) {
  const { stack } = useModal();
  const { savedHotspots } = useSavedHotspots();
  const { rename, remove } = useHotspotListActions(list);

  const openRename = () =>
    stack("hotspotListForm", {
      title: "Rename list",
      defaultValue: list.name,
      submitLabel: "Save",
      onSubmit: rename,
    });

  const handleAddToTrip = () =>
    stack("addToTrip", {
      subtitle: list.name,
      listId: list._id,
      hotspots: savedHotspotsInList(savedHotspots, list._id),
    });

  return (
    <li className="flex items-center gap-1 py-2">
      <span className="grow truncate text-sm font-medium text-foreground">
        {list.name}
      </span>
      <OptionsMenu
        items={[
          { name: "Rename", icon: <Pencil />, onClick: openRename },
          {
            name: "Import to Trip",
            icon: <MapPinPlus />,
            onClick: handleAddToTrip,
          },
          { name: "Delete", icon: <Trash2 />, onClick: remove, danger: true },
        ]}
        className="min-w-[180px]"
      >
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
            />
          }
          title="Options"
        >
          <Icon name="verticalDots" />
        </DropdownMenuTrigger>
      </OptionsMenu>
    </li>
  );
}
