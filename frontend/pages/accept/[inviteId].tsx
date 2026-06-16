import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import { useUser } from "providers/user";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@birdplan/shared";
import useMutation from "hooks/useMutation";
import { withReturnTo } from "lib/helpers";

export default function Accept() {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { inviteId } = router.query;
  const uid = user?.uid;
  const firedRef = React.useRef(false);

  const { isSuccess: profileLoaded } = useQuery<Profile>({
    queryKey: ["/profile"],
    enabled: !!uid,
  });

  const acceptMutation = useMutation({
    url: `/participants/${inviteId}/accept`,
    method: "PATCH",
    onSuccess: (data: any) => {
      const profile = queryClient.getQueryData<Profile>(["/profile"]);
      const dest = `/${data?.tripId}/lifelist?from=accept`;
      if (profile?.lifelist?.length) {
        router.push(dest);
      } else {
        router.push(`${withReturnTo("/import-lifelist", dest)}&onboarding=1`);
      }
    },
  });

  React.useEffect(() => {
    if (!uid || !inviteId || !profileLoaded || firedRef.current) return;
    firedRef.current = true;
    acceptMutation.mutate({});
  }, [uid, inviteId, profileLoaded]);

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
