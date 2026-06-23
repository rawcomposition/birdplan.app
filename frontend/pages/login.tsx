import React from "react";
import UtilityPage from "components/UtilityPage";
import AuthForm from "components/AuthForm";
import { Navigate, useSearchParams } from "react-router-dom";
import { useUser } from "hooks/useUser";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function Login() {
  const navContext = useNavContext();
  const [searchParams] = useSearchParams();
  const { loading, user } = useUser();

  if (user?.uid && !loading) {
    return <Navigate to={getPostAuthDest(navContext)} replace />;
  }

  const event = searchParams.get("event") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  const message = event === "emailUpdated" ? "Your email was updated. Sign in with your new email." : undefined;

  return (
    <UtilityPage heading="Welcome">
      <AuthForm heading="Enter your email" message={message} email={email} />
    </UtilityPage>
  );
}
