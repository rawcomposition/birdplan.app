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
      <div className="fixed inset-0 z-20 bg-white bg-opacity-70" />
      <div className="px-4 w-full fixed left-1/2 top-1/3 -translate-y-1/2 -translate-x-1/2 z-20">
        <div className="max-w-sm mx-auto sm:max-w-md shadow rounded-lg bg-white border p-8 pt-6">
          {loading ? (
            <div className="text-center">
              <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
            </div>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </>
  );
};

export default LoginModal;
