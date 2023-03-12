import * as React from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "lib/firebase";
import { User as FirebaseUser } from "firebase/auth";

export const UserContext = React.createContext<{
  user: FirebaseUser | null;
  refreshUser: () => Promise<void>;
}>({
  user: null,
  refreshUser: async () => {},
});

type Props = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);

  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const refreshUser = React.useCallback(async () => {
    await auth.currentUser?.reload();
    if (auth.currentUser) {
      setUser({ ...auth.currentUser });
    }
  }, []);

  return <UserContext.Provider value={{ user, refreshUser }}>{children}</UserContext.Provider>;
};

const useUser = () => {
  const state = React.useContext(UserContext);
  return { ...state };
};

export { UserProvider, useUser };
