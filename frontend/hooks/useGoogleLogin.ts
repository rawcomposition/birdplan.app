import React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function useGoogleLogin() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true);
    try {
      window.location.href = "/api/auth/sign-in/google";
    } catch (error) {
      toast.error("Login failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
