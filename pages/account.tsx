import React from "react";
import Header from "components/Header";
import Head from "next/head";
import Footer from "components/Footer";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";

export default function Account() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Account | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
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
            <p>Your account is connected to your Google account.</p>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
