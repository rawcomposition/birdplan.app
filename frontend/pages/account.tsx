import React from "react";
import Header from "components/Header";
import Heading from "components/Heading";
import BackLink from "components/BackLink";
import Footer from "components/Footer";
import { useUser } from "hooks/useUser";
import { useModal } from "stores/modals";
import Icon from "components/Icon";
import Avatar from "components/Avatar";
import { avatarFromUser } from "lib/avatar";
import { Button } from "components/ui/button";
import { IconNameT } from "lib/icons";
import EmailChangeForm from "components/EmailChangeForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";

type TabItem = {
  id: string;
  icon: IconNameT;
  label: string;
};

const tabs: TabItem[] = [
  { id: "profile", icon: "user", label: "Account" },
  { id: "email", icon: "envelope", label: "Change Email" },
  { id: "delete", icon: "warning", label: "Danger Zone" },
];

export default function Account() {
  const { user, loading } = useUser();
  const { open } = useModal();

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <title>My Account | BirdPlan.app</title>

      <Header />
      <main className="max-w-4xl w-full mx-auto px-4 lg:px-0">
        <BackLink to="/trips" label="Back to trips" className="mt-6" />
        <Heading title="My Account" icon="user" iconClassName="text-gray-600" className="mb-8 mt-4" />

        <Tabs defaultValue="profile" orientation="vertical" className="flex flex-col md:flex-row">
          <TabsList variant="pills" className="w-full md:w-64 flex-wrap md:flex-col gap-1 p-4 pl-0 mt-3">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="sm:w-full">
                <Icon name={tab.icon} className="w-5 h-5" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 p-4 md:p-8 bg-white shadow-sm rounded-lg sm:min-h-[400px] mb-4">
            <TabsContent value="profile">
              <h2 className="text-xl font-medium text-gray-800 mb-6">Account</h2>
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border rounded-lg w-full">
                  <Avatar user={avatarFromUser(user)} size={40} />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    {user.email && <p className="text-gray-600">{user.email}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email" className="max-w-md">
              <h2 className="text-xl font-medium text-gray-800 mb-6">Change Email</h2>
              <EmailChangeForm currentEmail={user.email || ""} />
            </TabsContent>

            <TabsContent value="delete">
              <h2 className="text-xl font-medium text-gray-800 mb-6">Delete Account</h2>

              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="danger" onClick={() => open("deleteAccount")}>
                  Delete Account
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
