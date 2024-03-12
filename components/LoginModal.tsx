import React from "react";
import { useUser } from "providers/user";
import Icon from "components/Icon";
import useFirebaseLogin from "hooks/useFirebaseLogin";

type Props = {
  showLoader?: boolean;
};

const LoginModal = ({ showLoader = true }: Props) => {
  const { login, loading: authLoading } = useFirebaseLogin();
  const { loading, user } = useUser();
  if (user?.uid && !loading) return null;
  if (!showLoader && (loading || authLoading)) return null;

  return (
    <>
      <div className="fixed inset-0 z-20 bg-white bg-opacity-70" />
      <div className="px-4 w-full fixed left-1/2 top-1/3 -translate-y-1/2 -translate-x-1/2 z-20">
        <div className="max-w-sm mx-auto sm:max-w-md shadow rounded-lg bg-white border p-8 pt-6">
          {loading || authLoading ? (
            <div className="text-center">
              <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
            </div>
          ) : (
            <>
              <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Let&apos;s get started</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Connect your Google account to login</p>
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
      </div>
    </>
  );
};

export default LoginModal;
