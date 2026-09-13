import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { SavedHotspot } from "@birdplan/shared";
import { HIDDEN_HOTSPOTS_KEY } from "hooks/useHiddenHotspots";
import { SAVED_HOTSPOTS_KEY } from "hooks/useSavedHotspots";

type Options = {
  url: string;
  method: "PUT" | "DELETE";
  updateCache: (old: string[]) => string[];
  updateSavedCache?: (old: SavedHotspot[]) => SavedHotspot[];
};

export default function useHiddenHotspotMutation({ url, method, updateCache, updateSavedCache }: Options) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, void>({
    mutationFn: async () => mutate(method, url),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: HIDDEN_HOTSPOTS_KEY });
      const prevHidden = queryClient.getQueryData<string[]>(HIDDEN_HOTSPOTS_KEY);
      const prevSaved = queryClient.getQueryData<SavedHotspot[]>(SAVED_HOTSPOTS_KEY);
      queryClient.setQueryData<string[]>(HIDDEN_HOTSPOTS_KEY, (old) => updateCache(old || []));
      if (updateSavedCache) {
        await queryClient.cancelQueries({ queryKey: SAVED_HOTSPOTS_KEY });
        queryClient.setQueryData<SavedHotspot[]>(SAVED_HOTSPOTS_KEY, (old) => updateSavedCache(old || []));
      }
      return { prevHidden, prevSaved };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: HIDDEN_HOTSPOTS_KEY });
      if (updateSavedCache) queryClient.invalidateQueries({ queryKey: SAVED_HOTSPOTS_KEY });
    },
    onError: (error, _data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData(HIDDEN_HOTSPOTS_KEY, context?.prevHidden);
      if (updateSavedCache) queryClient.setQueryData(SAVED_HOTSPOTS_KEY, context?.prevSaved);
    },
  });
}
