import React from "react";
import { auth } from "lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function useGoogleLogin() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/trips");
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
