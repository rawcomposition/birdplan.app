import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import { useRouter } from "next/router";
import Input from "components/Input";
import Button from "components/Button";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [success, setSuccess] = React.useState(false);
  const { loading: userLoading, user } = useUser();

  if (user?.uid && !userLoading) router.push("/trips");

  const mutation = useMutation({
    url: "/api/v1/reset-password",
    method: "POST",
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    mutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <UtilityPage heading="Reset Password">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600 mb-2">Invalid Link</h2>
          <p className="text-sm text-gray-500 mb-6">This password reset link is invalid or expired.</p>
          <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
            Request a new reset link
          </Link>
        </div>
      </UtilityPage>
    );
  }

  return (
    <UtilityPage heading="Reset Password">
      {success ? (
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-600 mb-2">Password Reset Successfully</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your password has been reset. You will be redirected to the login page.
          </p>
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Go to login
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Set New Password</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Enter a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input type="password" name="password" placeholder="New Password" required autoFocus />
            </div>
            <div>
              <Input type="password" name="confirmPassword" placeholder="Confirm Password" required />
            </div>
            <Button type="submit" color="primary" className="w-full" disabled={mutation.isPending || userLoading}>
              Reset Password
            </Button>
          </form>
        </>
      )}
    </UtilityPage>
  );
}
