import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { useModal } from "providers/modals";
import Icon from "components/Icon";
import Button from "components/Button";
import clsx from "clsx";
import { useState } from "react";
import { IconNameT } from "lib/icons";
import PasswordChangeForm from "components/PasswordChangeForm";
import EmailChangeForm from "components/EmailChangeForm";
import Link from "next/link";
import Alert from "components/Alert";

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
  { id: "email", icon: "envelope", label: "Email" },
  { id: "password", icon: "lock", label: "Password" },
  { id: "delete", icon: "warning", label: "Danger Zone" },
];

export default function Account() {
  const { user, loading } = useUser();
  const { open } = useModal();
  const [activeTab, setActiveTab] = useState<string>("profile");

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  const socialProviders =
    user.providerData
      ?.filter((provider) => provider.providerId !== "password")
      .map((provider) => providerNames[provider.providerId as keyof typeof providerNames]) || [];

  const isEmailProvider = user.providerData?.some((provider) => provider.providerId === "password") || false;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Account | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 lg:px-0">
        <Link href="/trips" className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
          ← Back to trips
        </Link>
        <h1 className="text-3xl font-bold text-gray-700 mb-8 mt-4">
          <Icon name="user" className="text-2xl text-gray-600" /> My Account
        </h1>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 p-4 pl-0">
            <nav className="flex flex-wrap md:flex-col gap-1 md:gap-1 mt-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={clsx(
                    "sm:w-full text-left py-2 px-4 rounded flex items-center gap-3 whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-100 bg-gray-100 sm:bg-transparent"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon name={tab.icon} className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-4 md:p-8 bg-white shadow rounded-lg sm:min-h-[400px] mb-4">
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
                  {socialProviders.length > 0 && (
                    <p className="text-sm text-gray-600">
                      You logged in using your <strong>{socialProviders.join(", ")}</strong> account.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="max-w-md">
                <h2 className="text-xl font-medium text-gray-800 mb-6">Change Email</h2>

                {!isEmailProvider ? (
                  <Alert style="warning">
                    You cannot change your email because you logged in using {socialProviders.join(", ")}.
                  </Alert>
                ) : (
                  <EmailChangeForm currentEmail={user.email || ""} />
                )}
              </div>
            )}

            {activeTab === "password" && (
              <div className="max-w-md">
                <h2 className="text-xl font-medium text-gray-800 mb-6">Change Password</h2>

                {isEmailProvider ? (
                  <PasswordChangeForm />
                ) : (
                  <Alert style="warning">
                    Your account is managed through your {socialProviders.join(", ")} account.
                  </Alert>
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
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
