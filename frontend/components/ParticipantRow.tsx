import React from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ParticipantView } from "@birdplan/shared";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import useMutation from "hooks/useMutation";
import ParticipantOptionsDropdown, { ParticipantMenuItem } from "components/ParticipantOptionsDropdown";
import Icon from "components/Icon";

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-600"];

type Props = {
  participant: ParticipantView;
  index: number;
  autoExpand?: boolean;
};

export default function ParticipantRow({ participant: p, index, autoExpand }: Props) {
  const { trip, isOwner, canEdit } = useTrip();
  const { open } = useModal();
  const queryClient = useQueryClient();
  const router = useRouter();

  const isSelf = p.isMe;
  const isPending = p.status === "pending";
  const isNameOnly = !p.uid && !isPending;
  const canChangeList = isSelf;

  const scrolledRef = React.useRef(false);
  const setRowRef = (node: HTMLDivElement | null) => {
    if (node && autoExpand && !scrolledRef.current) {
      scrolledRef.current = true;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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
        router.push("/trips");
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
  const initial = (p.name || p.email || "?").trim().charAt(0).toUpperCase();
  const canRemove = !p.isOwner && (p.isMe || canEdit);

  const items: ParticipantMenuItem[] = [];
  if (isSelf) {
    items.push({ name: "Change life list", icon: "feather", onClick: manageList });
  } else if (isNameOnly && canEdit) {
    items.push({ name: "Edit", icon: "pencil", onClick: manageList });
    items.push({
      name: "Invite as editor",
      icon: "envelope",
      onClick: () => open("inviteAsEditor", { participantId: p._id, name: p.name }),
    });
  } else if (isPending) {
    if (canEdit) items.push({ name: "Resend invite", icon: "envelope", onClick: () => resendMutation.mutate({}) });
    if (isOwner)
      items.push({ name: p.hasList ? "Replace life list" : "Attach life list", icon: "feather", onClick: manageList });
  }
  if (canRemove) {
    items.push({ name: p.isMe ? "Leave trip" : "Remove", icon: "trash", danger: true, onClick: handleRemove });
  }

  const secondary = !p.hasList
    ? "No life list"
    : `${p.listMode === "world" ? "World list" : "Custom list"} · ${p.count.toLocaleString()} species`;

  return (
    <div
      ref={setRowRef}
      className={clsx(
        "border-b border-gray-100 last:border-0 transition-colors",
        autoExpand && "-mx-2 rounded-lg bg-blue-50/50 px-2 ring-1 ring-blue-200"
      )}
    >
      <div className="flex items-center gap-3.5 py-3">
        <span
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
            AVATAR_COLORS[index % AVATAR_COLORS.length]
          )}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {label}
            {p.isMe && <span className="ml-1.5 text-xs font-normal text-gray-400">(you)</span>}
            {p.isOwner && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                Owner
              </span>
            )}
            {isPending && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                <Icon name="envelope" className="text-[10px]" /> Pending
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 tabular-nums">
            {secondary}
            {canChangeList && (
              <>
                <span className="mx-1.5">–</span>
                <button type="button" onClick={manageList} className="font-medium text-sky-600 hover:underline">
                  change
                </button>
              </>
            )}
          </p>
        </div>

        <ParticipantOptionsDropdown items={items} />
      </div>
    </div>
  );
}
