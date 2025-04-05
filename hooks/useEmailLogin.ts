import { auth } from "lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function useEmailLogin() {
  const router = useRouter();
  const login = async (email: string, password: string, disableLoader = false) => {
    const toastId = disableLoader ? undefined : toast.loading("Signing in...");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/trips");
    } catch (error: any) {
      console.log("login error", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Invalid password");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Error signing in");
      }
    } finally {
      if (!disableLoader) toast.dismiss(toastId);
    }
  };

  return { login };
}
