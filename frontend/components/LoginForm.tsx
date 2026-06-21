import React from "react";
import { useUser } from "providers/user";
import useGoogleLogin from "hooks/useGoogleLogin";
import useEmailLogin from "hooks/useEmailLogin";
import Input from "components/Input";
import Button from "components/Button";
import GoogleIcon from "components/GoogleIcon";
import { Link } from "react-router-dom";
import { getForwardReturnTo, withQueryParams, withReturnTo } from "lib/helpers";
import useNavContext from "hooks/useNavContext";

type Props = {
  message?: string;
  email?: string;
};

export default function LoginForm({ message, email }: Props) {
  const navContext = useNavContext();
  const [emailLoginLoading, setEmailLoginLoading] = React.useState(false);
  const { login: googleLogin, loading: googleLoading } = useGoogleLogin();
  const { login: emailLogin } = useEmailLogin();
  const { loading: userLoading } = useUser();

  const signupHref = withQueryParams(withReturnTo("/signup", getForwardReturnTo(navContext)), { email });

  const isLoading = userLoading || googleLoading || emailLoginLoading;

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailLoginLoading(true);

    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;
    const password = formData.get("password") as string;

    await emailLogin(emailValue, password);
    setEmailLoginLoading(false);
  };

  return (
    <>
      <h2 className="text-lg text-center font-bold text-gray-600 mb-1">Welcome back</h2>
      {message ? (
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
      ) : (
        <p className="text-sm text-gray-500 text-center mb-6">Sign in to your account to continue</p>
      )}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <Input key={email} type="email" name="email" placeholder="Email" required autoFocus={!email} defaultValue={email} />
        </div>
        <div>
          <Input type="password" name="password" placeholder="Password" required autoFocus={!!email} />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-sm text-link">
              Forgot password?
            </Link>
          </div>
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
          <Link to={signupHref} className="font-medium text-link">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
