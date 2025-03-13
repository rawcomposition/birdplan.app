import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/helpers";
import { Trip } from "lib/types";
import { useTrip } from "providers/trip";

type Options<TInput> = {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: Trip, data: TInput) => Trip;
  mutationKey?: string[];
};

export default function useTripMutation<TInput>({ url, method, updateCache, mutationKey }: Options<TInput>) {
  const { trip } = useTrip();
  const queryClient = useQueryClient();

  return useMutation<any, Error, TInput>({
    mutationKey,
    mutationFn: async (input?: TInput) => {
      const res = await mutate(method, url, input);
      return res;
    },
    onMutate: async (input) => {
      if (!trip?._id) return;
      await queryClient.cancelQueries({ queryKey: [`/api/trips/${trip?._id}`] });
      const prevData = queryClient.getQueryData([`/api/trips/${trip?._id}`]);

      queryClient.setQueryData<Trip | undefined>([`/api/trips/${trip?._id}`], (old) => {
        if (!old) return old;
        return updateCache(old, input);
      });

      return { prevData };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData([`/api/trips/${trip?._id}`], context?.prevData);
    },
  });
}
