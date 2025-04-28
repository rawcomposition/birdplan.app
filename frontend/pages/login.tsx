import React from "react";
import UtilityPage from "components/UtilityPage";
import LoginForm from "components/LoginForm";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  const event = router.query.event as string | undefined;

  const message =
    event === "emailUpdated"
      ? "Email updated successfully. Please sign in again."
      : event === "passwordUpdated"
        ? "Password updated successfully. Please sign in again."
        : undefined;

  return (
    <UtilityPage heading="Sign in">
      <LoginForm message={message} />
    </UtilityPage>
  );
}
