import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import useFirebaseLogin from "hooks/useFirebaseLogin";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const { login, loading: authLoading } = useFirebaseLogin();
  const { loading, user } = useUser();
  if (user?.uid && !loading) router.push("/trips");

  return (
    <UtilityPage heading="Login">
      <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Connect your Google account to log back in</p>
      <div className="text-center">
        <button
          type="button"
          onClick={login}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          disabled={authLoading}
        >
          {authLoading ? "loading..." : "Login in with Google"}
        </button>
      </div>
    </UtilityPage>
  );
}
