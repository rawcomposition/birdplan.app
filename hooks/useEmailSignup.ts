import { auth } from "lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useState } from "react";

export default function useEmailSignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signup = async (email: string, password: string) => {
    setLoading(true);
    const toastId = toast.loading("Creating account...");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!", { id: toastId });
      router.push("/trips");
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email address is already in use.", { id: toastId });
      } else if (error.code === "auth/weak-password") {
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
