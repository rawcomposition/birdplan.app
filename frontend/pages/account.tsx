import React from "react";
import Header from "components/Header";
import Footer from "components/Footer";
import { useUser } from "providers/user";
import { useModal } from "providers/modals";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import { avatarFromProfile } from "lib/avatar";
import Button from "components/Button";
import clsx from "clsx";
import { useState } from "react";
import { IconNameT } from "lib/icons";
import EmailChangeForm from "components/EmailChangeForm";
import { Link } from "react-router-dom";
import { useProfile } from "providers/profile";

type TabItem = {
  id: string;
  icon: IconNameT;
  label: string;
};

const tabs: TabItem[] = [
  { id: "profile", icon: "user", label: "Account" },
  { id: "email", icon: "envelope", label: "Email" },
  { id: "delete", icon: "warning", label: "Danger Zone" },
];

export default function Account() {
  const { user, loading } = useUser();
  const profile = useProfile();
  const { open } = useModal();
  const [activeTab, setActiveTab] = useState<string>("profile");

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
        <title>My Account | BirdPlan.app</title>

      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 lg:px-0">
        <Link to="/trips" className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
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

          <div className="flex-1 p-4 md:p-8 bg-white shadow-sm rounded-lg sm:min-h-[400px] mb-4">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-medium text-gray-800 mb-6">Account</h2>
                <div className="flex flex-col gap-4 mb-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border rounded-lg w-full">
                    <Avatar user={avatarFromProfile(profile)} size={40} />
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      {profile.email && <p className="text-gray-600">{profile.email}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="max-w-md">
                <h2 className="text-xl font-medium text-gray-800 mb-6">Change Email</h2>
                <EmailChangeForm currentEmail={profile.email || ""} />
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
    </div>
  );
}
