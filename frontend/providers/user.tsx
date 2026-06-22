import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@birdplan/shared";
import { useSessionToken } from "lib/sessionToken";

export const UserContext = React.createContext<{
  user: Profile | null;
  refreshUser: () => Promise<void>;
  loading: boolean;
}>({
  user: null,
  refreshUser: async () => {},
  loading: false,
});

type Props = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: Props) => {
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

  return <UserContext.Provider value={{ loading, user, refreshUser }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const state = React.useContext(UserContext);
  return { ...state };
};

export { UserProvider, useUser };
