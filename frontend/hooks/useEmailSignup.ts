import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState } from "react";

export default function useEmailSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signup = async (name: string, email: string, password: string) => {
    setLoading(true);
    const toastId = toast.loading("Creating account...");
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sign up failed");
      }

      toast.success("Account created successfully!", { id: toastId });
      router.push("/trips");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("already exists")) {
        toast.error("Email address is already in use.", { id: toastId });
      } else if (error.message?.includes("weak password")) {
        toast.error("Password is too weak. Please choose a stronger password.", { id: toastId });
      } else {
        toast.error("Error creating account. Please try again.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
}
