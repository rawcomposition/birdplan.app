import React from "react";
import { HotspotList, HotspotListInput } from "@birdplan/shared";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Pencil, Trash2 } from "lucide-react";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import useHotspotLists from "hooks/useHotspotLists";
import useHotspotListMutation from "hooks/useHotspotListMutation";

export default function ManageHotspotLists() {
  const { close } = useModal();
  const { lists } = useHotspotLists();
  const [newName, setNewName] = React.useState("");
  const trimmed = newName.trim();

  const createList = useHotspotListMutation<HotspotListInput>({
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    createList.mutate({ name: trimmed });
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
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(list.name);
  const trimmed = name.trim();
  const isPending = list._id.startsWith("new-");

  const renameList = useHotspotListMutation<HotspotListInput>({
    url: `/hotspot-lists/${list._id}`,
    method: "PATCH",
    updateCache: (old, input) => old.map((it) => (it._id === list._id ? { ...it, name: input.name } : it)),
  });

  const deleteList = useHotspotListMutation<{}>({
    url: `/hotspot-lists/${list._id}`,
    method: "DELETE",
    updateCache: (old) => old.filter((it) => it._id !== list._id),
    updateSavedCache: (old) =>
      old
        .map((it) => ({ ...it, listIds: it.listIds.filter((id) => id !== list._id) }))
        .filter((it) => it.listIds.length > 0),
  });

  const startEditing = () => {
    setName(list.name);
    setIsEditing(true);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    if (trimmed !== list.name) renameList.mutate({ name: trimmed });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${list.name}"? Hotspots that are only in this list will be removed.`)) return;
    deleteList.mutate({});
  };

  if (isEditing) {
    return (
      <li className="py-2">
        <form onSubmit={handleRename} className="flex items-center gap-2">
          <Input
            size="sm"
            autoFocus
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setIsEditing(false)}
          />
          <Button type="submit" size="sm" disabled={!trimmed}>
            Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1 py-2">
      <span className="grow truncate text-sm font-medium text-foreground">{list.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        aria-label="Rename list"
        disabled={isPending}
        onClick={startEditing}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete list"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
