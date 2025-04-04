import React, { useState } from "react";
import { useRouter } from "next/router";
import { Header, Body, Footer, useModal } from "providers/modals";
import useMutation from "hooks/useMutation";
import toast from "react-hot-toast";
import Button from "components/Button";
import useFirebaseLogout from "hooks/useFirebaseLogout";

export default function DeleteAccount() {
  const [confirmInput, setConfirmInput] = useState("");
  const router = useRouter();
  const { close } = useModal();
  const { logout } = useFirebaseLogout();

  const CONFIRM_TEXT = "DELETE";
  const isConfirmed = confirmInput === CONFIRM_TEXT;

  const deleteAccountMutation = useMutation({
    url: "/api/v1/account",
    method: "DELETE",
    onSuccess: async () => {
      close();
      await logout();
      toast.success("Your account has been deleted");
      router.push("/");
    },
  });

  const isDeleting = deleteAccountMutation.isPending;

  const handleDeleteAccount = () => {
    if (!isConfirmed) return;
    deleteAccountMutation.mutate(undefined);
  };

  return (
    <>
      <Header>Delete Account</Header>
      <Body className="min-h-0">
        <div className="py-2">
          <p className="mb-4">Are you sure you want to delete your account? This will permanently remove:</p>
          <ul className="list-disc pl-5 mb-6">
            <li>Your profile information</li>
            <li>All trips you&apos;ve created</li>
            <li>All trip and user related data</li>
          </ul>

          <div className="mb-4">
            <p className="mb-2 font-semibold text-red-600">This action cannot be undone.</p>
            <p className="mb-4">
              To confirm, please type <strong>{CONFIRM_TEXT}</strong> in the box below:
            </p>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder={`Type ${CONFIRM_TEXT} to confirm`}
              disabled={isDeleting}
            />
          </div>
        </div>
      </Body>
      <Footer>
        <div className="flex justify-between w-full">
          <Button onClick={close} disabled={isDeleting} color="grayOutline">
            Cancel
          </Button>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account Permanently"}
          </button>
        </div>
      </Footer>
    </>
  );
}
