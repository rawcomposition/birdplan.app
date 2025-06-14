import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import { useRouter } from "next/router";
import Input from "components/Input";
import Button from "components/Button";
import useMutation from "hooks/useMutation";
import Link from "next/link";
import Alert from "components/Alert";

export default function ForgotPassword() {
  const router = useRouter();
  const [submitted, setSubmitted] = React.useState(false);
  const { loading: userLoading, user } = useUser();

  if (user?.uid && !userLoading) router.push("/trips");

  const mutation = useMutation({
    url: "/auth/forgot-password",
    method: "POST",
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    mutation.mutate({ email });
  };

  return (
    <UtilityPage heading="Reset Password">
      {submitted ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600 mb-2">Email Sent</h2>
          <Alert style="info" className="mb-6">
            If an account exists with this email, you will receive password reset instructions shortly.
          </Alert>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            ← Return to login
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-lg text-center font-bold text-gray-600 mb-2">Forgot your password?</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input type="email" name="email" placeholder="Email" required autoFocus />
            </div>
            <Button type="submit" color="primary" className="w-full" disabled={mutation.isPending || userLoading}>
              Send Reset Link
            </Button>
          </form>
          <div className="text-center mt-6">
            <Link href="/login" className="font-medium text-sm text-blue-600 hover:text-blue-500">
              ← Back to login
            </Link>
          </div>
        </>
      )}
    </UtilityPage>
  );
}
