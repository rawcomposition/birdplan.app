import React from "react";
import UtilityPage from "components/UtilityPage";
import LoginForm from "components/LoginForm";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();

  const event = searchParams.get("event") ?? undefined;
  const email = searchParams.get("email") ?? undefined;

  const message =
    event === "emailUpdated"
      ? "Email updated successfully. Please sign in again."
      : event === "passwordUpdated"
        ? "Password updated successfully. Please sign in again."
        : undefined;

  return (
    <UtilityPage heading="Sign in">
      <LoginForm message={message} email={email} />
    </UtilityPage>
  );
}
