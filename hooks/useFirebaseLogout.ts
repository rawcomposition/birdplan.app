import React from "react";
import { auth } from "lib/firebase";
import { signOut } from "firebase/auth";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      localStorage.clear();
    } catch (error) {
      alert("Error logging out");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}