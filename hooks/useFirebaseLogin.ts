import React from "react";
import { auth } from "lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";

export default function useFirebaseLogin() {
  const [loading, setLoading] = React.useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
