import React from "react";
import LoginForm from "components/LoginForm";
import { useUser } from "providers/user";
import Icon from "components/Icon";
import ModalWrapper from "components/ModalWrapper";

type Props = {
  showLoader?: boolean;
};

const LoginModal = ({ showLoader = true }: Props) => {
  const { loading, user } = useUser();
  if (user?.uid && !loading) return null;
  if (!showLoader && loading) return null;

  return (
    <ModalWrapper open position="center" maxHeight="90vh" dismissable={false} onClose={() => {}}>
      <div className="p-8 pt-6">
        {loading ? (
          <div className="text-center">
            <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </ModalWrapper>
  );
};

export default LoginModal;
