import React from "react";
import { useUser } from "providers/user";
import Loading from "icons/Loading";
import useFirebaseLogin from "hooks/useFirebaseLogin";

type Props = {};

const LoginModal = ({}: Props) => {
  const { login, loading: authLoading } = useFirebaseLogin();
  const { loading, user } = useUser();
  if (user?.uid && !loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-20 bg-white bg-opacity-70" />
      <div className="fixed w-full max-w-sm sm:max-w-md z-20 shadow rounded-lg bg-white border p-8 pt-6 left-1/2 top-1/3 -translate-y-1/2 -translate-x-1/2">
        {loading || authLoading ? (
          <div className="text-center">
            <Loading className="animate-spin text-4xl text-slate-500" />
          </div>
        ) : (
          <>
            <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Let&apos;s get started</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Connect your Google account to start planning</p>
            <div className="text-center">
              <button
                type="button"
                onClick={login}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Sign in with Google
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LoginModal;
