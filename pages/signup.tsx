import React from "react";
import { useUser } from "providers/user";
import UtilityPage from "components/UtilityPage";
import { useRouter } from "next/router";
import Input from "components/Input";
import Button from "components/Button";
import GoogleIcon from "components/GoogleIcon";
import useEmailSignup from "hooks/useEmailSignup";
import useGoogleLogin from "hooks/useGoogleLogin";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const { loading: userLoading, user } = useUser();
  const { signup: emailSignup, loading: emailSignupLoading } = useEmailSignup();
  const { login: googleLogin, loading: googleLoading } = useGoogleLogin();

  if (user?.uid && !userLoading) router.push("/trips");

  const isLoading = userLoading || emailSignupLoading || googleLoading;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    await emailSignup(name, email, password);
  };

  return (
    <UtilityPage heading="Sign Up">
      <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Let&apos;s get started</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Create an account to start planning</p>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </UtilityPage>
  );
}
