import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { HotspotList, SavedHotspot } from "@birdplan/shared";
import { HOTSPOT_LISTS_KEY } from "hooks/useHotspotLists";

const SAVED_KEY = ["/saved-hotspots"];

type Options<TInput> = {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: HotspotList[], data: TInput) => HotspotList[];
  updateSavedCache?: (old: SavedHotspot[], data: TInput) => SavedHotspot[];
};

export default function useHotspotListMutation<TInput, TResponse = any>({
  url,
  method,
  updateCache,
  updateSavedCache,
}: Options<TInput>) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TInput>({
    mutationFn: async (input?: TInput) => mutate(method, url, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: HOTSPOT_LISTS_KEY });
      const prevLists = queryClient.getQueryData<HotspotList[]>(HOTSPOT_LISTS_KEY);
      const prevSaved = queryClient.getQueryData<SavedHotspot[]>(SAVED_KEY);
      queryClient.setQueryData<HotspotList[]>(HOTSPOT_LISTS_KEY, (old) => updateCache(old || [], input));
      if (updateSavedCache) {
        await queryClient.cancelQueries({ queryKey: SAVED_KEY });
        queryClient.setQueryData<SavedHotspot[]>(SAVED_KEY, (old) => updateSavedCache(old || [], input));
      }
      return { prevLists, prevSaved };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HOTSPOT_LISTS_KEY });
      if (updateSavedCache) queryClient.invalidateQueries({ queryKey: SAVED_KEY });
    },
    onError: (error, _data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData(HOTSPOT_LISTS_KEY, context?.prevLists);
      if (updateSavedCache) queryClient.setQueryData(SAVED_KEY, context?.prevSaved);
    },
  });
}
