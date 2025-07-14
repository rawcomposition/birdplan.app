import React from "react";
import { useSession } from "lib/betterAuth";

type User = {
  id: string;
  name?: string;
  email?: string;
};

export const UserContext = React.createContext<{
  user: User | null;
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
  const { data: session, isPending } = useSession();

  const refreshUser = React.useCallback(async () => {
    // Better Auth handles session refresh automatically
  }, []);

  return (
    <UserContext.Provider
      value={{
        loading: isPending,
        user: session?.user || null,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserProvider;
