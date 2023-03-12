import React from "react";
import { auth } from "lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function useFirebaseLogin() {
  const [error, setError] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(false);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
