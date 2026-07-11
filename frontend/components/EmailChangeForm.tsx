import React, { useState } from "react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Field from "components/Field";
import { Alert } from "components/ui/alert";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  currentEmail: string;
};

export default function EmailChangeForm({ currentEmail }: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const requestMutation = useMutation({
    url: "/account/request-email-change",
    method: "POST",
    showToastError: false,
    onSuccess: () => {
      setError(null);
      setStep("code");
    },
    onError: (err: any) => setError(err.message || "Something went wrong. Please try again."),
  });

  const updateMutation = useMutation({
    url: "/account/update-email",
    method: "POST",
    showToastError: false,
    onSuccess: () => {
      toast.success("Email updated successfully");
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      setStep("email");
      setEmail("");
      setCode("");
    },
    onError: (err: any) => setError(err.message || "Invalid or expired code."),
  });

  const handleRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized === currentEmail.toLowerCase()) return;
    setError(null);
    requestMutation.mutate({ email: normalized });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    updateMutation.mutate({ email: email.trim().toLowerCase(), code: code.trim() });
  };

  const isDirty = !!email.trim() && email.trim().toLowerCase() !== currentEmail.toLowerCase();

  return (
    <div className="max-w-md">
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {step === "email" ? (
        <form onSubmit={handleRequest} className="space-y-4">
          <Field label="New Email">
            <Input size="sm"
              type="email"
              name="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </Field>
          <p className="text-sm text-gray-600">
            We&apos;ll send a 6-digit code to your new email to confirm the change.
          </p>
          <Button
            variant="default"
            type="submit"
            loading={requestMutation.isPending}
            loadingText="Sending..."
            disabled={!isDirty}
          >
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <Field label={`Enter the code sent to ${email}`}>
            <Input size="sm"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="code"
              maxLength={6}
              value={code}
              placeholder="6-digit code"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </Field>
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="lg"
              type="submit"
              loading={updateMutation.isPending}
              loadingText="Updating..."
              disabled={code.length < 6}
            >
              Update Email
            </Button>
            <Button
              variant="link"
              type="button"
              className="text-sm"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
