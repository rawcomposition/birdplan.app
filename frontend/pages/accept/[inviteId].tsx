import React from "react";
import Header from "components/Header";
import Head from "next/head";
import LoginModal from "components/LoginModal";
import Alert from "components/Alert";
import Button from "components/Button";
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
    showToastError: false,
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

  const retry = () => acceptMutation.mutate({});

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Accept Invite | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="flex items-center justify-center h-full p-4">
        {uid && acceptMutation.isError ? (
          <div className="flex flex-col items-center gap-6 max-w-xs w-full">
            <h2 className="text-xl font-bold text-gray-700">Error accepting invite</h2>
            <Alert style="error" className="w-full justify-center text-center">
              {acceptMutation.error?.message || "We couldn't accept this invite."}
            </Alert>
            <div className="flex items-center gap-2">
              <Button color="grayOutline" onClick={retry} disabled={acceptMutation.isPending}>
                {acceptMutation.isPending ? "Trying again..." : "Try again"}
              </Button>
              <Button color="primary" href="/trips">
                Go to my trips
              </Button>
            </div>
          </div>
        ) : (
          uid && <span className="text-2xl text-gray-600">One moment...</span>
        )}
      </main>
      <LoginModal />
    </div>
  );
}
