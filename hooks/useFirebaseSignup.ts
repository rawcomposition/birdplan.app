import React from "react";
import { auth, uploadSeenSpeciesFromLocalStorage } from "lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useUser } from "providers/user";

export default function useFirebaseSignup() {
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const { refreshUser } = useUser();

  const createUser = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(false);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await refreshUser();
      }
      uploadSeenSpeciesFromLocalStorage();
    } catch (error) {
      setError(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
}
