import React from "react";
import { auth } from "lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import { useProfile } from "providers/profile";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { reset: resetProfile } = useProfile();

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      resetProfile();
      localStorage.clear();
      router.push("/");
    } catch (error) {
      alert("Error logging out");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
