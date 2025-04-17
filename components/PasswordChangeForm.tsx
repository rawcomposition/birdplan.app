import React, { useState } from "react";
import Button from "components/Button";
import Input from "components/Input";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";
import Field from "components/Field";

export default function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mutation = useMutation({
    url: "/api/v1/account/update-password",
    method: "POST",
    onSuccess: () => {
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    mutation.mutate({ password: newPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Field label="New Password">
          <Input
            type="password"
            name="password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            required
          />
        </Field>
      </div>
      <div>
        <Field label="Confirm Password">
          <Input
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
      </div>

      <Button
        type="submit"
        color="primary"
        disabled={mutation.isPending || !newPassword || !confirmPassword}
        className="mt-2"
      >
        Update Password
      </Button>
    </form>
  );
}
