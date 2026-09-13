import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { SavedHotspot } from "@birdplan/shared";
import { SAVED_HOTSPOTS_KEY } from "hooks/useSavedHotspots";
import { HIDDEN_HOTSPOTS_KEY } from "hooks/useHiddenHotspots";

type Options<TInput> = {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: SavedHotspot[], data: TInput) => SavedHotspot[];
  updateHiddenCache?: (old: string[], data: TInput) => string[];
};

export default function useSavedHotspotMutation<TInput, TResponse = any>({
  url,
  method,
  updateCache,
  updateHiddenCache,
}: Options<TInput>) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TInput>({
    mutationFn: async (input?: TInput) => mutate(method, url, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: SAVED_HOTSPOTS_KEY });
      const prevData = queryClient.getQueryData<SavedHotspot[]>(SAVED_HOTSPOTS_KEY);
      const prevHidden = queryClient.getQueryData<string[]>(HIDDEN_HOTSPOTS_KEY);
      queryClient.setQueryData<SavedHotspot[]>(SAVED_HOTSPOTS_KEY, (old) => updateCache(old || [], input));
      if (updateHiddenCache) {
        await queryClient.cancelQueries({ queryKey: HIDDEN_HOTSPOTS_KEY });
        queryClient.setQueryData<string[]>(HIDDEN_HOTSPOTS_KEY, (old) => updateHiddenCache(old || [], input));
      }
      return { prevData, prevHidden };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_HOTSPOTS_KEY });
      if (updateHiddenCache) queryClient.invalidateQueries({ queryKey: HIDDEN_HOTSPOTS_KEY });
    },
    onError: (error, _data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData(SAVED_HOTSPOTS_KEY, context?.prevData);
      if (updateHiddenCache) queryClient.setQueryData(HIDDEN_HOTSPOTS_KEY, context?.prevHidden);
    },
  });
}
