import toast from "react-hot-toast";
import { useMutation as tanMutation, UseMutationOptions } from "@tanstack/react-query";
import { mutate } from "lib/http";

type Options<TData, TVariables> = Omit<UseMutationOptions<TData, unknown, TVariables>, "mutationFn"> & {
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  showToastError?: boolean;
};

export default function useMutation<TData = unknown, TVariables = unknown>({
  url,
  method,
  showToastError = true,
  onError,
  ...options
}: Options<TData, TVariables>) {
  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  return tanMutation<TData, Error, TVariables>({
    mutationFn: async (data?: TVariables) => {
      const res = await mutate(method, fullUrl, data);
      return res as TData;
    },
    onError: (err: any, variables, context) => {
      if (showToastError) toast.error(err.message || "An error occurred");
      if (onError) onError(err, variables, context);
    },
    ...options,
  });
}
