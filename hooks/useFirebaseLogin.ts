import React from "react";
import { auth } from "lib/firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider, indexedDBLocalPersistence, setPersistence } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function useFirebaseLogin() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const login = async () => {
    setLoading(true);
    const auth = getAuth();
    setPersistence(auth, indexedDBLocalPersistence)
      .then(() => {
        const provider = new GoogleAuthProvider();
        // In memory persistence will be applied to the signed in Google user
        // even though the persistence was set to 'none' and a page redirect
        // occurred.
        return signInWithPopup(auth, provider);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return { login, loading };
}
