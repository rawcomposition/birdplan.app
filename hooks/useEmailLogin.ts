import { auth } from "lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/trips");
    } catch (error: any) {
      console.log("login error", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Invalid password", { id: toastId });
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.", { id: toastId });
      } else {
        toast.error("Error signing in", { id: toastId });
      }
    } finally {
      if (!disableLoader) toast.dismiss(toastId);
      setLoading(false);
    }
  };

  return { login, loading };
}
