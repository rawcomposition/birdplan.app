import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import SignupForm from "components/SignupForm";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function Signup() {
  const navigate = useNavigate();
  const navContext = useNavContext();
  const [searchParams] = useSearchParams();
  const { loading: userLoading, user } = useUser();

  if (user?.uid && !userLoading) navigate(getPostAuthDest(navContext));

  const email = searchParams.get("email") ?? undefined;

  return (
    <UtilityPage heading="Sign Up">
      <SignupForm email={email} />
    </UtilityPage>
  );
}
