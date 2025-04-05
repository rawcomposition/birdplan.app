import React from "react";
import { useUser } from "providers/user";
import useGoogleLogin from "hooks/useGoogleLogin";
import useEmailLogin from "hooks/useEmailLogin";
import Input from "components/Input";
import Button from "components/Button";
import GoogleIcon from "components/GoogleIcon";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [emailLoginLoading, setEmailLoginLoading] = React.useState(false);

  const { login: googleLogin, loading: googleLoading } = useGoogleLogin();
  const { login: emailLogin } = useEmailLogin();
  const { loading: userLoading } = useUser();

  const isLoading = userLoading || googleLoading || emailLoginLoading;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoginLoading(true);
    try {
      await emailLogin(email, password);
    } finally {
      setEmailLoginLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Welcome back</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Sign in to your account to continue</p>
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" color="primary" className="w-full" disabled={isLoading}>
          Sign In
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
          Sign In with Google
        </Button>
      </div>
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
