import React from "react";
import UtilityPage from "components/UtilityPage";
import AuthForm from "components/AuthForm";
import { Navigate, useSearchParams } from "react-router-dom";
import { useUser } from "hooks/useUser";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function Signup() {
  const navContext = useNavContext();
  const [searchParams] = useSearchParams();
  const { loading, user } = useUser();

  if (user?._id && !loading) {
    return <Navigate to={getPostAuthDest(navContext)} replace />;
  }

  const email = searchParams.get("email") ?? undefined;

  return (
    <UtilityPage heading="Get started">
      <AuthForm email={email} />
    </UtilityPage>
  );
}
