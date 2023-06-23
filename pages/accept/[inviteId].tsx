import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { auth } from "lib/firebase";
import { useRouter } from "next/router";
import { useProfile } from "providers/profile";

export default function Accept() {
  const { user } = useUser();
  const { lifelist } = useProfile();
  const router = useRouter();
  const { inviteId } = router.query;
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    (async () => {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/accept", {
        method: "post",
        body: JSON.stringify({ inviteId }),
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
      });
      const { tripId } = await res.json();
      router.push(!!lifelist?.length ? `/${tripId}` : `/import-lifelist?tripId=${tripId}`);
    })();
  }, [uid]);

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Bird Planner</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="flex items-center justify-center h-full">
        {uid && <span className="text-2xl text-gray-600">One moment...</span>}
      </main>
      <LoginModal />
    </div>
  );
}
