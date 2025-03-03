import React from "react";
import toast from "react-hot-toast";
import { useMutation as tanMutation, UseMutationOptions } from "@tanstack/react-query";
import { nanoId } from "lib/helpers";
import { auth } from "lib/firebase";

type Options = Omit<UseMutationOptions, "mutationFn"> & {
  url: string;
  method: "POST" | "GET" | "PUT" | "DELETE" | "PATCH";
  showToast?: boolean;
  successMessage?: string;
};

export default function useMutation({
  url,
  method,
  showToast = true,
  successMessage,
  onError,
  onSuccess,
  onSettled,
  onMutate,
  ...options
}: Options) {
  const toastId = React.useMemo(() => nanoId(6), []);

  return tanMutation({
    mutationFn: async (data?: any) => {
      const fetchUrl = data?.url || url;
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(fetchUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(data),
      });
      let json: any = {};
      try {
        json = await res.json();
      } catch (error) {}
      if (!res.ok) {
        if (res.status === 404) throw new Error("Route not found");
        if (res.status === 405) throw new Error("Method not allowed");
        if (res.status === 504) throw new Error("Operation timed out. Please try again.");
        throw new Error(json.error || "An error ocurred");
      }

      return json;
    },
    onError: (err: any, variables, context) => {
      if (showToast) toast.error(err.message || "An error ocurred", { id: toastId });
      if (onError) onError(err, variables, context);
    },
    onSuccess: (data, variables, context) => {
      if (showToast) toast.success(successMessage || "Success", { id: toastId });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onMutate: (variables) => {
      if (showToast) toast.loading("loading...", { id: toastId });
      if (onMutate) onMutate(variables);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...options,
  });
}
