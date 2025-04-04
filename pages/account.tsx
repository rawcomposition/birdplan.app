import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { useModal } from "providers/modals";

const providerNames = {
  "google.com": "Google",
  "apple.com": "Apple",
};

export default function Account() {
  const { user } = useUser();
  const { open } = useModal();

  if (!user) return null;

  const providers = user.providerData
    .filter((provider) => provider.providerId !== "password")
    .map((provider) => providerNames[provider.providerId as keyof typeof providerNames]);

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Account | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-lg w-full mx-auto pb-12">
        <div className="p-4 md:p-0 mt-12">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">👤 My Account</h1>
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border rounded-lg w-full">
              {user.photoURL && <img src={user.photoURL} className="h-[32px] w-[32px] object-cover rounded-full" />}
              <div className="text-sm">
                <p className="font-semibold">{user?.displayName}</p>
                {user.email && <p className="text-gray-600">{user.email}</p>}
              </div>
            </div>
            {providers.length > 0 && (
              <p>
                You logged in using your <strong>{providers.join(", ")}</strong> account.
              </p>
            )}
          </div>

          <div className="mt-8 border-t pt-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Danger Zone</h2>

            <button
              onClick={() => open("deleteAccount")}
              className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center transition-colors"
            >
              Delete my account
            </button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
