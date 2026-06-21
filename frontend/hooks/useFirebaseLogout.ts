import React from "react";
import { auth } from "lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function useFirebaseLogout() {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase auth not initialized");
      await signOut(auth);
      queryClient.clear();
      navigate("/");
    } catch (error) {
      alert("Error logging out");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading };
}
