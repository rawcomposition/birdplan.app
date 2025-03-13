import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { useRouter } from "next/router";
import { useProfile } from "providers/profile";
import useMutation from "hooks/useMutation";

export default function Accept() {
  const { user } = useUser();
  const { lifelist } = useProfile();
  const router = useRouter();
  const { inviteId } = router.query;
  const uid = user?.uid;
  const hasLifelistRef = React.useRef(!!lifelist?.length);
  hasLifelistRef.current = !!lifelist?.length;

  const acceptMutation = useMutation({
    url: `/api/invites/${inviteId}/accept`,
    method: "PATCH",
    onSuccess: (data: any) => {
      router.push(hasLifelistRef.current ? `/${data?.tripId}` : `/import-lifelist?tripId=${data.tripId}`);
    },
  });

  React.useEffect(() => {
    if (!uid || !inviteId) return;
    acceptMutation.mutate({});
  }, [uid, inviteId]);

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Accept Invite | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="flex items-center justify-center h-full">
        {uid && <span className="text-2xl text-gray-600">One moment...</span>}
      </main>
      <LoginModal />
    </div>
  );
}
