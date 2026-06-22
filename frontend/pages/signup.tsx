import React from "react";
import UtilityPage from "components/UtilityPage";
import AuthForm from "components/AuthForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "providers/user";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function Signup() {
  const navigate = useNavigate();
  const navContext = useNavContext();
  const [searchParams] = useSearchParams();
  const { loading, user } = useUser();

  if (user?.uid && !loading) {
    navigate(getPostAuthDest(navContext));
    return null;
  }

  const email = searchParams.get("email") ?? undefined;

  return (
    <UtilityPage heading="Get started">
      <AuthForm email={email} />
    </UtilityPage>
  );
}
