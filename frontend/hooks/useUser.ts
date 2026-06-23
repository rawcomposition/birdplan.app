import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@birdplan/shared";
import { useSessionToken } from "lib/sessionToken";

export const useUser = () => {
  const token = useSessionToken();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Profile>({
    queryKey: ["/auth/me"],
    enabled: !!token,
  });

  const user = token ? data ?? null : null;
  const loading = !!token && isLoading;

  const refreshUser = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
  }, [queryClient]);

  return { user, loading, refreshUser };
};
