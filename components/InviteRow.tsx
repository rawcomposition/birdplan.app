import React from "react";
import Button from "components/Button";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Invite } from "lib/types";

type Props = {
  invite: Invite;
};

export default function InviteRow({ invite }: Props) {
  const { trip } = useTrip();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    url: `/api/invites/${invite._id}`,
    method: "DELETE",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${trip?._id}/invites`] });
    },
  });

  const removeUser = async () => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    deleteMutation.mutate({});
  };

  return (
    <li className="flex items-center justify-between mt-2 pt-2">
      <div className="flex flex-col text-sm text-gray-700">
        <span>{invite.email}</span>
      </div>
      <Button type="button" size="sm" onClick={removeUser} disabled={deleteMutation.isPending}>
        {deleteMutation.isPending ? "..." : "Remove"}
      </Button>
    </li>
  );
}
