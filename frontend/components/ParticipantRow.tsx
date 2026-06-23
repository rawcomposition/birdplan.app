import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ParticipantView } from "@birdplan/shared";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import useMutation from "hooks/useMutation";
import ParticipantOptionsDropdown, { ParticipantMenuItem } from "components/ParticipantOptionsDropdown";
import Badge from "components/Badge";
import Button from "components/Button";
import Avatar from "components/Avatar";
import { avatarFromParticipant } from "lib/avatar";
import { Feather, Pencil, Mail, Trash2 } from "lucide-react";

type Props = {
  participant: ParticipantView;
};

export default function ParticipantRow({ participant: p }: Props) {
  const { trip, isOwner, canEdit } = useTrip();
  const { open } = useModal();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isSelf = p.isMe;
  const isPending = p.status === "pending";
  const isNameOnly = !p.uid && !isPending;
  const canChangeList = isSelf;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
  };

  const resendMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${p._id}/resend`,
    method: "POST",
    onSuccess: () => toast.success("Invite resent"),
  });

  const deleteMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${p._id}`,
    method: "DELETE",
    onSuccess: () => {
      invalidate();
      if (p.isMe) {
        queryClient.invalidateQueries({ queryKey: ["/trips"] });
        navigate("/trips");
      }
    },
  });

  const manageList = () => open("manageLifelist", { participantId: p._id });

  const handleRemove = () => {
    if (!confirm(p.isMe ? "Remove yourself from this trip?" : `Remove ${p.name || p.email || "this participant"}?`))
      return;
    deleteMutation.mutate({});
  };

  const label = p.name || p.email || "Unknown";
  const canRemove = !p.isOwner && (p.isMe || canEdit);

  const items: ParticipantMenuItem[] = [];
  if (isSelf) {
    items.push({ name: "Change life list", icon: <Feather />, onClick: manageList });
  } else if (isNameOnly && canEdit) {
    items.push({ name: "Edit", icon: <Pencil />, onClick: manageList });
    items.push({
      name: "Invite as editor",
      icon: <Mail />,
      onClick: () => open("inviteAsEditor", { participantId: p._id, name: p.name }),
    });
  } else if (isPending) {
    if (canEdit) items.push({ name: "Resend invite", icon: <Mail />, onClick: () => resendMutation.mutate({}) });
    if (isOwner)
      items.push({ name: p.hasList ? "Replace life list" : "Attach life list", icon: <Feather />, onClick: manageList });
  }
  if (canRemove) {
    items.push({ name: p.isMe ? "Leave trip" : "Remove", icon: <Trash2 />, danger: true, onClick: handleRemove });
  }

  const secondary = !p.hasList
    ? "No life list"
    : `${p.listMode === "world" ? "World list" : "Custom list"} · ${p.count.toLocaleString()} species`;

  return (
    <div className="border-b border-gray-100 last:border-0 transition-colors">
      <div className="flex items-center gap-3.5 py-3">
        <Avatar user={avatarFromParticipant(p)} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {label}
            {p.isMe && <span className="ml-1.5 text-xs font-normal text-gray-400">(you)</span>}
            {p.isOwner && <Badge>Owner</Badge>}
            {isPending && (
              <Badge color="amber" icon="envelope">
                Pending
              </Badge>
            )}
          </p>
          <p className="text-xs text-gray-500 tabular-nums">
            {secondary}
            {canChangeList && (
              <>
                <span className="mx-1.5">–</span>
                <Button type="button" onClick={manageList} color="link" size="none">
                  change
                </Button>
              </>
            )}
          </p>
        </div>

        <ParticipantOptionsDropdown items={items} />
      </div>
    </div>
  );
}
