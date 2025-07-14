import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState } from "react";

export default function useEmailLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, disableLoader = false) => {
    setLoading(true);
    const toastId = disableLoader ? undefined : toast.loading("Signing in...");
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign in failed");
      }

      router.push("/trips");
      toast.dismiss(toastId);
    } catch (error: any) {
      if (error.message?.includes("Invalid credentials")) {
        toast.error("Invalid email or password", { id: toastId });
      } else if (error.message?.includes("Too many attempts")) {
        toast.error("Too many attempts. Please try again later.", { id: toastId });
      } else {
        toast.error("Error signing in", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
