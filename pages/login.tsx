import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import { useRouter } from "next/router";
import LoginForm from "components/LoginForm";

export default function Login() {
  const router = useRouter();
  const { loading, user } = useUser();
  if (user?.uid && !loading) router.push("/trips");

  return (
    <UtilityPage heading="Sign in">
      <LoginForm />
    </UtilityPage>
  );
}
