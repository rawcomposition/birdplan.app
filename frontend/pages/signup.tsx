import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import SignupForm from "components/SignupForm";
import { useRouter } from "next/router";
import { getPostAuthDest } from "lib/helpers";

export default function Signup() {
  const router = useRouter();
  const { loading: userLoading, user } = useUser();

  if (user?.uid && !userLoading) router.push(getPostAuthDest(router));

  const email = typeof router.query.email === "string" ? router.query.email : undefined;

  return (
    <UtilityPage heading="Sign Up">
      <SignupForm email={email} />
    </UtilityPage>
  );
}
