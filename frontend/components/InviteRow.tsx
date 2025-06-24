import React from "react";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Invite } from "@birdplan/shared";
import { useUser } from "providers/user";
import { useRouter } from "next/router";
import { useModal } from "providers/modals";

type Props = {
  invite: Invite;
};

export default function InviteRow({ invite }: Props) {
  const { trip } = useTrip();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const isMe = invite.uid === user?.uid;
  const { close } = useModal();
  const router = useRouter();

  const deleteMutation = useMutation({
    url: `/invites/${invite._id}`,
    method: "DELETE",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/invites`] });
      if (isMe) {
        queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
        queryClient.invalidateQueries({ queryKey: ["/trips"] });
        close();
        router.push("/trips");
      }
    },
  });

  const removeUser = async () => {
    if (!confirm(isMe ? "Are you sure you want to remove yourself?" : "Are you sure you want to remove this user?"))
      return;
    deleteMutation.mutate({});
  };

  return (
    <li className="flex items-center justify-between mt-2 pt-2">
      <div className="text-sm text-gray-700">
        <span>{invite.email}</span> {isMe && <span>(me)</span>}
      </div>
      <Button type="button" size="sm" onClick={removeUser} disabled={deleteMutation.isPending}>
        {deleteMutation.isPending ? "..." : "Remove"}
      </Button>
    </li>
  );
}
