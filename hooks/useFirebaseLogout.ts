import React from "react";
import { auth } from "lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
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
