import React from "react";
import UtilityPage from "components/UtilityPage";
import LoginForm from "components/LoginForm";
import SignupForm from "components/SignupForm";
import AcceptError from "components/AcceptError";
import Button from "components/Button";
import Icon from "components/Icon";
import { useUser } from "providers/user";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile, InviteInfo } from "@birdplan/shared";
import useMutation from "hooks/useMutation";
import { withReturnTo } from "lib/helpers";

export default function Accept() {
  const { user, loading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { inviteId } = router.query;
  const uid = user?.uid;
  const firedRef = React.useRef(false);

  const { isSuccess: profileLoaded } = useQuery<Profile>({
    queryKey: ["/profile"],
    enabled: !!uid,
  });

  const {
    data: invite,
    isError: inviteIsError,
    error: inviteError,
    refetch: refetchInvite,
    isFetching: inviteFetching,
  } = useQuery<InviteInfo>({
    queryKey: [`/participants/${inviteId}/invite`],
    enabled: !!inviteId && !uid,
    retry: false,
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

  const method = invite?.method;
  const inviteLoading = !invite && !inviteIsError;

  const heading = invite ? (
    <>
      <p className="text-base font-normal text-gray-500">
        {invite.inviterName ? `${invite.inviterName} invited you to join` : "You've been invited to join"}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold text-gray-900">{invite.tripName}</h2>
    </>
  ) : (
    "Accept Invite"
  );

  return (
    <UtilityPage heading={heading} title="Accept Invite">
      {loading || (!uid && inviteLoading) ? (
        <div className="text-center">
          <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
        </div>
      ) : !uid && inviteIsError ? (
        <AcceptError
          title="Error accepting invite"
          message={inviteError?.message || "This invite is no longer valid."}
          onRetry={() => refetchInvite()}
          retrying={inviteFetching}
        >
          <Button color="primary" href="/">
            Go to homepage
          </Button>
        </AcceptError>
      ) : !uid && invite && invite.status !== "pending" ? (
        <AcceptError title="Error accepting invite" message="This invite has already been accepted.">
          <Button color="primary" href="/">
            Go to homepage
          </Button>
        </AcceptError>
      ) : !uid ? (
        method === "login" ? (
          <LoginForm email={invite?.email} />
        ) : (
          <SignupForm email={invite?.email} />
        )
      ) : acceptMutation.isError ? (
        <AcceptError
          title="Error accepting invite"
          message={acceptMutation.error?.message || "We couldn't accept this invite."}
          onRetry={retry}
          retrying={acceptMutation.isPending}
        >
          <Button color="primary" href="/trips">
            Go to my trips
          </Button>
        </AcceptError>
      ) : (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-600">
          <Icon name="loading" className="animate-spin" /> One moment...
        </div>
      )}
    </UtilityPage>
  );
}
