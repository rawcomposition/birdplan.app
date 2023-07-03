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
  const hasLifelistRef = React.useRef(!!lifelist?.length);
  hasLifelistRef.current = !!lifelist?.length;

  React.useEffect(() => {
    if (!uid || !inviteId) return;
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
      router.push(hasLifelistRef.current ? `/${tripId}` : `/import-lifelist?tripId=${tripId}`);
    })();
  }, [uid, inviteId]);

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Accept Invite | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="flex items-center justify-center h-full">
        {uid && <span className="text-2xl text-gray-600">One moment...</span>}
      </main>
      <LoginModal />
    </div>
  );
}
