import React from "react";
import UtilityPage from "components/UtilityPage";
import AuthForm from "components/AuthForm";
import { Alert } from "components/ui/alert";
import { Navigate, useSearchParams } from "react-router-dom";
import { useUser } from "hooks/useUser";
import { getPostAuthDest } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

export default function Login() {
  const navContext = useNavContext();
  const [searchParams] = useSearchParams();
  const { loading, user } = useUser();

  if (user?._id && !loading) {
    return <Navigate to={getPostAuthDest(navContext)} replace />;
  }

  const event = searchParams.get("event") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  const message = event === "emailUpdated" ? "Your email was updated. Sign in with your new email." : undefined;

  return (
    <UtilityPage heading="Welcome">
      <Alert variant="muted" className="mb-4">
        <p>
          <strong>We’ve simplified sign-in.</strong> Google sign-in is no longer available, but you can still access
          your account by entering your email below.
        </p>
      </Alert>
      <AuthForm heading="Enter your email" message={message} email={email} />
    </UtilityPage>
  );
}
