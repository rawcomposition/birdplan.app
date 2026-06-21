import React from "react";
import { auth } from "lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function useGoogleLogin() {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const navContext = useNavContext();

  const login = async () => {
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase auth not initialized");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(getPostAuthDest(navContext));
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
