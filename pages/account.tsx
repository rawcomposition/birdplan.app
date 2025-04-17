import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { useModal } from "providers/modals";
import Icon from "components/Icon";
import Button from "components/Button";
import Input from "components/Input";
import clsx from "clsx";
import useMutation from "hooks/useMutation";
import { useState } from "react";
import toast from "react-hot-toast";
import { IconNameT } from "lib/icons";
import PasswordChangeForm from "components/PasswordChangeForm";

const providerNames = {
  "google.com": "Google",
  "apple.com": "Apple",
};

type TabItem = {
  id: string;
  icon: IconNameT;
  label: string;
};

const tabs: TabItem[] = [
  { id: "profile", icon: "user", label: "Account" },
  { id: "email", icon: "comment", label: "Email" },
  { id: "password", icon: "lock", label: "Password" },
  { id: "delete", icon: "trash", label: "Delete Account" },
];

export default function Account() {
  const { user, loading } = useUser();
  const { open } = useModal();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [newEmail, setNewEmail] = useState("");

  const updateEmailMutation = useMutation({
    url: "/api/v1/account/update-email",
    method: "POST",
    onSuccess: () => {
      toast.success("Email updated successfully");
      setNewEmail("");
    },
  });

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const providers = user.providerData
    .filter((provider) => provider.providerId !== "password")
    .map((provider) => providerNames[provider.providerId as keyof typeof providerNames]);

  const isEmailProvider = !providers.length;

  const handleUpdateEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail) return;
    updateEmailMutation.mutate({ email: newEmail });
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Account | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-6xl w-full mx-auto pb-12 flex flex-col md:flex-row">
        <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r md:min-h-[calc(100vh-60px)]">
          <nav className="flex overflow-x-auto md:flex-col gap-1 md:gap-1 mt-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={clsx(
                  "w-full text-left py-2 px-4 rounded flex items-center gap-3",
                  activeTab === tab.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-4 md:p-8">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-6">Account</h2>
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border rounded-lg w-full">
                  {user.photoURL ? (
                    <img src={user.photoURL} className="h-[40px] w-[40px] object-cover rounded-full" />
                  ) : (
                    <div className="h-[40px] w-[40px] rounded-full bg-gray-200 flex items-center justify-center">
                      <Icon name="user" className="text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user?.displayName}</p>
                    {user.email && <p className="text-gray-600">{user.email}</p>}
                  </div>
                </div>
                {providers.length > 0 && (
                  <p className="text-sm text-gray-600">
                    You logged in using your <strong>{providers.join(", ")}</strong> account.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-6">Email Settings</h2>

              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 mb-2">Current Email</h3>
                <p className="text-gray-800 bg-gray-100 px-4 py-2 rounded border">{user.email}</p>
              </div>

              {!isEmailProvider && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700 text-sm">
                    Your account is linked to {providers.join(", ")}. Email changes must be made through your provider.
                  </p>
                </div>
              )}

              {isEmailProvider && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Change Email</h3>
                  <form onSubmit={handleUpdateEmail} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        name="email"
                        placeholder="New Email Address"
                        value={newEmail}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" color="primary" disabled={updateEmailMutation.isPending}>
                      Update Email
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-6">Change Password</h2>

              {isEmailProvider ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Update your password to keep your account secure.</p>

                  <PasswordChangeForm />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Your account is managed through your {providers.join(", ")} account.
                </p>
              )}
            </div>
          )}

          {activeTab === "delete" && (
            <div>
              <h2 className="text-xl font-medium text-gray-800 mb-6">Delete Account</h2>

              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button color="red" size="sm" onClick={() => open("deleteAccount")}>
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
