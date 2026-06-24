import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@birdplan/shared";
import { useSessionToken } from "lib/sessionToken";

export const useUser = () => {
  const token = useSessionToken();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<User>({
    queryKey: ["/auth/me"],
    enabled: !!token,
  });

  const user = token ? data ?? null : null;
  const loading = !!token && isLoading;
  const lifelist = user?.lifelist?.filter((it) => !user.exceptions?.includes(it)) ?? [];

  const refreshUser = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
  }, [queryClient]);

  return { user, lifelist, loading, refreshUser };
};
