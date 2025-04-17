import React, { useState } from "react";
import Button from "components/Button";
import Input from "components/Input";
import toast from "react-hot-toast";
import Field from "components/Field";
import { useRouter } from "next/router";
import { auth } from "lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

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

    if (newPassword.length < 8) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("User not found");
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
      router.push("/login?event=passwordUpdated");
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        toast.error("Current password is incorrect");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else if (error.code === "auth/requires-recent-login") {
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <Field label="Current Password">
          <Input
            type="password"
            name="currentPassword"
            value={currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            required
          />
        </Field>
      </div>
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

      <p className="text-sm text-gray-600">You will need to sign in again after updating your password.</p>

      <Button
        type="submit"
        color="primary"
        disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
        className="mt-2"
      >
        Update Password
      </Button>
    </form>
  );
}
