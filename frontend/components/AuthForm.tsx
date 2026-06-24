import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "components/Input";
import Field from "components/Field";
import Button from "components/Button";
import Alert from "components/Alert";
import useRequestCode from "hooks/useRequestCode";
import useVerifyCode from "hooks/useVerifyCode";
import useReportNoCode from "hooks/useReportNoCode";
import useNavContext from "hooks/useNavContext";
import { getPostAuthDest, withReturnTo } from "lib/helpers";

type Props = {
  heading?: string;
  message?: string;
  email?: string;
  lockEmail?: boolean;
};

const RESEND_COOLDOWN = 30;

export default function AuthForm({ heading, message, email: initialEmail, lockEmail }: Props) {
  const navigate = useNavigate();
  const navContext = useNavContext();
  const [step, setStep] = React.useState<"email" | "code">("email");
  const [email, setEmail] = React.useState(initialEmail || "");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);
  const [showHelp, setShowHelp] = React.useState(false);

  const requestCode = useRequestCode();
  const verifyCode = useVerifyCode();
  const reportNoCode = useReportNoCode();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = async (targetEmail: string) => {
    setError(null);
    try {
      await requestCode.mutateAsync({ email: targetEmail });
      setStep("code");
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const backToEmail = () => {
    setStep("email");
    setCode("");
    setCooldown(0);
    setShowHelp(false);
    setError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (step === "code") backToEmail();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === "email") {
      if (!email.trim()) return;
      sendCode(email.trim().toLowerCase());
      return;
    }
    setError(null);
    try {
      const res = await verifyCode.mutateAsync({ email: email.trim().toLowerCase(), code: code.trim() });
      const dest = getPostAuthDest(navContext);
      navigate(res.isNewUser ? withReturnTo("/onboarding", dest) : dest);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    }
  };

  const pending = requestCode.isPending || verifyCode.isPending;
  const disabled = step === "email" ? pending || !email.trim() : pending || code.length < 6;

  return (
    <>
      {heading && <h2 className="text-lg text-center font-bold text-gray-600 mb-1">{heading}</h2>}
      {message && <p className="text-sm text-gray-500 text-center mb-6">{message}</p>}

      {error && (
        <Alert style="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoFocus={!lockEmail}
            disabled={lockEmail}
            value={email}
            onChange={handleEmailChange}
          />
        </Field>

        {step === "code" && (
          <Field label="Verification code">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="code"
              placeholder="6-digit code"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <span className="text-xs text-gray-400">We sent a code to your inbox</span>
          </Field>
        )}

        <Button type="submit" color="primary" className="w-full" disabled={disabled}>
          Continue
        </Button>

        {step === "code" && (
          <div className="text-center text-sm">
            {showHelp ? (
              <div className="space-y-3 text-left text-gray-500">
                <p>
                  We sent a code to <span className="font-medium text-gray-700">{email}</span>.{" "}
                  <button type="button" className="text-link font-medium" onClick={backToEmail}>
                    Change email
                  </button>
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>It can take 1–2 minutes to arrive.</li>
                  <li>Check your spam or junk folder.</li>
                  <li>
                    {cooldown > 0 ? (
                      <span className="text-gray-400">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        className="text-link font-medium disabled:opacity-50"
                        onClick={() => sendCode(email.trim().toLowerCase())}
                        disabled={requestCode.isPending}
                      >
                        Resend code
                      </button>
                    )}
                  </li>
                </ul>
                <p>
                  Still stuck?{" "}
                  <Link to="/contact" className="text-link font-medium">
                    Contact us
                  </Link>
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="text-link font-medium"
                onClick={() => {
                  setShowHelp(true);
                  if (email.trim()) reportNoCode.mutate({ email: email.trim().toLowerCase() });
                }}
              >
                Didn't receive the email?
              </button>
            )}
          </div>
        )}
      </form>
    </>
  );
}
