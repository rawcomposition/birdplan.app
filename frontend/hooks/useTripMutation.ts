import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutate } from "lib/http";
import { Trip } from "@birdplan/shared";
import { useTrip } from "hooks/useTrip";

type Options<TInput, TResponse> = {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  updateCache: (old: Trip, data: TInput) => Trip;
  mutationKey?: string[];
  reconcile?: (old: Trip, response: TResponse, data: TInput) => Trip;
};

export default function useTripMutation<TInput, TResponse = any>({
  url,
  method,
  updateCache,
  mutationKey,
  reconcile,
}: Options<TInput, TResponse>) {
  const { trip } = useTrip();
  const queryClient = useQueryClient();

  return useMutation<TResponse, Error, TInput>({
    mutationKey,
    mutationFn: async (input?: TInput) => {
      const res = await mutate(method, url, input);
      return res;
    },
    onMutate: async (input) => {
      if (!trip?._id) return;
      await queryClient.cancelQueries({ queryKey: [`/trips/${trip?._id}`] });
      const prevData = queryClient.getQueryData([`/trips/${trip?._id}`]);

      queryClient.setQueryData<Trip | undefined>([`/trips/${trip?._id}`], (old) => {
        if (!old) return old;
        return updateCache(old, input);
      });

      return { prevData };
    },
    onSuccess: (response, input) => {
      if (!reconcile || !trip?._id) return;
      queryClient.setQueryData<Trip | undefined>([`/trips/${trip._id}`], (old) =>
        old ? reconcile(old, response, input) : old
      );
    },
    onSettled: () => {
      if (reconcile) return;
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
    onError: (error, data, context: any) => {
      toast.error(error.message || "An error occurred");
      queryClient.setQueryData([`/trips/${trip?._id}`], context?.prevData);
    },
  });
}
