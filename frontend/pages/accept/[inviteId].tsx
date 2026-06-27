import React from "react";
import UtilityPage from "components/UtilityPage";
import AcceptError from "components/AcceptError";
import Button from "components/Button";
import Icon from "components/Icon";
import { useUser } from "hooks/useUser";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AcceptInviteResponse, InviteInfo } from "@birdplan/shared";
import useMutation from "hooks/useMutation";
import { setSessionToken } from "lib/sessionToken";
import { withReturnTo } from "lib/helpers";
import { Flow } from "lib/enums";

export default function Accept() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { inviteId } = useParams();

  const {
    data: invite,
    isError: inviteIsError,
    error: inviteError,
    refetch: refetchInvite,
    isFetching: inviteFetching,
  } = useQuery<InviteInfo>({
    queryKey: [`/participants/${inviteId}/invite`],
    enabled: !!inviteId,
    retry: false,
  });

  const acceptMutation = useMutation<AcceptInviteResponse>({
    url: `/participants/${inviteId}/accept`,
    method: "POST",
    showToastError: false,
    onSuccess: async (data) => {
      if (data.token) {
        setSessionToken(data.token);
        await queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      }
      const dest = `/${data.tripId}/lifelist?from=${Flow.Accept}`;
      if (!data.hasName) {
        navigate(withReturnTo("/onboarding", dest));
      } else if (!data.hasLifelist) {
        navigate(`${withReturnTo("/import-lifelist", dest)}&onboarding=1`);
      } else {
        navigate(dest);
      }
    },
  });

  const accept = () => acceptMutation.mutate({});

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

  const renderBody = () => {
    if (loading || inviteLoading) {
      return (
        <div className="text-center">
          <Icon name="loading" className="animate-spin text-4xl text-slate-500" />
        </div>
      );
    }

    if (inviteIsError) {
      return (
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
      );
    }

    if (!invite || invite.status !== "pending") {
      return (
        <AcceptError title="Invite already accepted" message="This invite has already been accepted.">
          <Button color="primary" href={invite ? `/${invite.tripId}` : "/trips"}>
            Go to trip
          </Button>
        </AcceptError>
      );
    }

    if (acceptMutation.isError) {
      return (
        <AcceptError
          title="Error accepting invite"
          message={acceptMutation.error?.message || "We couldn't accept this invite."}
          onRetry={accept}
          retrying={acceptMutation.isPending}
        >
          <Button color="primary" href="/trips">
            Go to my trips
          </Button>
        </AcceptError>
      );
    }

    return (
      <div className="space-y-3">
        {!user && (
          <p className="text-center text-gray-600">
            Accept as <span className="font-semibold text-gray-800">{invite.email}</span>.
          </p>
        )}
        <Button color="primary" className="w-full" onClick={accept} disabled={acceptMutation.isPending}>
          {acceptMutation.isPending ? "Accepting..." : user ? `Accept as ${user.email}` : "Accept invitation"}
        </Button>
      </div>
    );
  };

  return (
    <UtilityPage heading={heading} title="Accept Invite">
      {renderBody()}
    </UtilityPage>
  );
}
