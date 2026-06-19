import React from "react";
import { useUser } from "providers/user";
import useGoogleLogin from "hooks/useGoogleLogin";
import useEmailSignup from "hooks/useEmailSignup";
import Input from "components/Input";
import Button from "components/Button";
import GoogleIcon from "components/GoogleIcon";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { getForwardReturnTo, withQueryParams, withReturnTo } from "lib/helpers";

type Props = {
  message?: string;
  email?: string;
};

export default function SignupForm({ message, email }: Props) {
  const router = useRouter();
  const { signup: emailSignup, loading: emailSignupLoading } = useEmailSignup();
  const { login: googleLogin, loading: googleLoading } = useGoogleLogin();
  const { loading: userLoading } = useUser();

  const loginHref = withQueryParams(withReturnTo("/login", getForwardReturnTo(router)), { email });

  const isLoading = userLoading || emailSignupLoading || googleLoading;

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    await emailSignup(name, emailValue, password);
  };

  return (
    <>
      <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Let&apos;s get started</h2>
      {message ? (
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
      ) : (
        <p className="text-sm text-gray-500 text-center mb-6">Create an account to start planning</p>
      )}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <Input type="text" name="name" placeholder="Name" required autoFocus />
        </div>
        <div>
          <Input key={email} type="email" name="email" placeholder="Email" required defaultValue={email} />
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Input type="password" name="password" placeholder="Password" required />
          <Input type="password" name="confirmPassword" placeholder="Confirm Password" required />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={isLoading}>
          Sign Up
        </Button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>
      <div className="text-center">
        <Button
          onClick={googleLogin}
          color="grayOutline"
          className="flex gap-2 w-full justify-center items-center"
          disabled={isLoading}
        >
          <GoogleIcon className="text-lg" />
          {googleLoading ? "Processing..." : "Sign Up with Google"}
        </Button>
      </div>
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
