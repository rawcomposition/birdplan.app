import React from "react";
import LoginForm from "components/LoginForm";
import { useUser } from "providers/user";
import Icon from "components/Icon";

type Props = {
  showLoader?: boolean;
};

const LoginModal = ({ showLoader = true }: Props) => {
  const { loading, user } = useUser();
  if (user?.uid && !loading) return null;
  if (!showLoader && loading) return null;

  return (
    <>
      <div className="fixed inset-0 z-20 bg-white bg-opacity-70 overflow-y-auto">
        <div className="min-h-screen px-4 py-8 flex items-center sm:items-start sm:pt-[15vh] justify-center">
          <div className="max-w-sm w-full sm:max-w-md shadow rounded-lg bg-white border p-8 pt-6 relative my-8">
            {loading ? (
              <div className="text-center">
                <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
              </div>
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
