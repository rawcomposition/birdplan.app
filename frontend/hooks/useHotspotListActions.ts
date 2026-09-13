import { HotspotList, HotspotListInput } from "@birdplan/shared";
import useHotspotListMutation from "hooks/useHotspotListMutation";

export default function useHotspotListActions(list: HotspotList) {
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
        .filter((it) => it.listIds.length > 0 || !!it.notes),
  });

  const rename = (name: string) => {
    if (name !== list.name) renameList.mutate({ name });
  };

  const remove = () => {
    if (!confirm(`Delete "${list.name}"? Hotspots that are only in this list will be removed.`)) return;
    deleteList.mutate({});
  };

  return { rename, remove };
}
