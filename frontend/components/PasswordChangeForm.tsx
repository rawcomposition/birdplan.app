import React, { useState } from "react";
import Button from "components/Button";
import Input from "components/Input";
import toast from "react-hot-toast";
import Field from "components/Field";
import { useRouter } from "next/router";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Password change failed");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
      router.push("/login?event=passwordUpdated");
    } catch (error: any) {
      if (error.message?.includes("current password")) {
        toast.error("Current password is incorrect");
      } else if (error.message?.includes("too many attempts")) {
        toast.error("Too many attempts. Please try again later.");
      } else if (error.message?.includes("recent login")) {
        toast.error("Please sign in again before changing your password");
        router.push("/login");
      } else {
        toast.error("Error updating password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Current Password">
        <Input
          type="password"
          value={currentPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />
      </Field>

      <Field label="New Password">
        <Input
          type="password"
          value={newPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
      </Field>

      <Field label="Confirm New Password">
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
        />
      </Field>

      <Button type="submit" loading={isLoading} className="w-full">
        Update Password
      </Button>
    </form>
  );
}
