import React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

export const UserContext = React.createContext<{
  user: FirebaseUser | null;
  refreshUser: () => Promise<void>;
  isInitialized: boolean;
}>({
  user: null,
  refreshUser: async () => {},
  isInitialized: false,
});

type Props = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);

  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsInitialized(true);
    });
  }, []);

  const refreshUser = React.useCallback(async () => {
    await auth.currentUser?.reload();
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
    }
  }, []);

  return <UserContext.Provider value={{ isInitialized, user, refreshUser }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const state = React.useContext(UserContext);
  return { ...state };
};

export { UserProvider, useUser };
