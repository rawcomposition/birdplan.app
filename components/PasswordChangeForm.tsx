import React, { useState } from "react";
import Button from "components/Button";
import Input from "components/Input";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";

export default function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const updatePasswordMutation = useMutation({
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
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    updatePasswordMutation.mutate({ password: newPassword });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Input
          type="password"
          name="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

      <Button type="submit" color="primary" disabled={updatePasswordMutation.isPending} className="mt-2">
        Update Password
      </Button>
    </form>
  );
}
