import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { Label, SavedHotspot } from "@birdplan/shared";
import { LABELS_KEY } from "hooks/useLabels";

const SAVED_KEY = ["/saved-hotspots"];

type Options<TInput> = {
  url: string | ((data: TInput) => string);
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: Label[], data: TInput) => Label[];
  updateSavedCache?: (old: SavedHotspot[], data: TInput) => SavedHotspot[];
};

export default function useLabelMutation<TInput, TResponse = any>({
  url,
  method,
  updateCache,
  updateSavedCache,
}: Options<TInput>) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TInput>({
    mutationFn: async (input?: TInput) => mutate(method, typeof url === "function" ? url(input as TInput) : url, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: LABELS_KEY });
      const prevLabels = queryClient.getQueryData<Label[]>(LABELS_KEY);
      const prevSaved = queryClient.getQueryData<SavedHotspot[]>(SAVED_KEY);
      queryClient.setQueryData<Label[]>(LABELS_KEY, (old) => updateCache(old || [], input));
      if (updateSavedCache) {
        await queryClient.cancelQueries({ queryKey: SAVED_KEY });
        queryClient.setQueryData<SavedHotspot[]>(SAVED_KEY, (old) => updateSavedCache(old || [], input));
      }
      return { prevLabels, prevSaved };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LABELS_KEY });
      if (updateSavedCache) queryClient.invalidateQueries({ queryKey: SAVED_KEY });
    },
    onError: (error, _data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData(LABELS_KEY, context?.prevLabels);
      if (updateSavedCache) queryClient.setQueryData(SAVED_KEY, context?.prevSaved);
    },
  });
}
