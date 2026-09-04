import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { SavedHotspot } from "@birdplan/shared";

const QUERY_KEY = ["/saved-hotspots"];

type Options<TInput> = {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: SavedHotspot[], data: TInput) => SavedHotspot[];
};

export default function useSavedHotspotMutation<TInput, TResponse = any>({ url, method, updateCache }: Options<TInput>) {
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TInput>({
    mutationFn: async (input?: TInput) => mutate(method, url, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const prevData = queryClient.getQueryData<SavedHotspot[]>(QUERY_KEY);
      queryClient.setQueryData<SavedHotspot[]>(QUERY_KEY, (old) => updateCache(old || [], input));
      return { prevData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error, _data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData(QUERY_KEY, context?.prevData);
    },
  });
}
