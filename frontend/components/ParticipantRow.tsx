import React from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ParticipantView } from "@birdplan/shared";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import LifelistUpload from "components/LifelistUpload";
import Icon from "components/Icon";

// Repeating palette for avatars — keyed by row position.
const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-600"];

type Props = {
  participant: ParticipantView;
  index: number;
};

export default function ParticipantRow({ participant: p, index }: Props) {
  const { trip, isOwner, canEdit } = useTrip();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showReplace, setShowReplace] = React.useState(false);

  const isNamedOnly = !p.uid;
  const isPending = p.status === "pending";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
  };

  const listMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${p._id}/list`,
    method: "PUT",
    onSuccess: () => {
      toast.success("List updated");
      setShowReplace(false);
      invalidate();
    },
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

  const handleImport = (sciNames: string[]) => listMutation.mutate({ sciNames });

  const handleRemove = () => {
    if (!confirm(p.isMe ? "Remove yourself from this trip?" : `Remove ${p.name || p.email || "this participant"}?`))
      return;
    deleteMutation.mutate({});
  };

  const label = p.name || p.email || "Unknown";
  const initial = (p.name || p.email || "?").trim().charAt(0).toUpperCase();
  const canRemove = !p.isOwner && (p.isMe || canEdit);
  // Only the owner replaces a named-only person's list; registered users manage their own on /lifelist.
  const showUpload = isNamedOnly && isOwner && showReplace;

  return (
    <div className="border-b border-gray-100 last:border-0">
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
          </p>
          <p className="text-xs text-gray-500 tabular-nums">
            {isPending ? (
              <span className="inline-flex items-center gap-1">
                <Icon name="envelope" className="text-[10px]" /> Invite pending
              </span>
            ) : (
              `${p.listMode === "world" ? "World list" : "Custom list"} · ${p.count.toLocaleString()} species`
            )}
          </p>
        </div>

        {/* Named-only management (owner only): replace the uploaded list. To rename, remove and re-add. */}
        {isNamedOnly && isOwner && !isPending && (
          <button
            type="button"
            onClick={() => setShowReplace((s) => !s)}
            title="Replace list"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Icon name="feather" className="text-sm" />
          </button>
        )}

        {canRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={deleteMutation.isPending}
            title="Remove"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            <Icon name="xMark" className="text-sm" />
          </button>
        )}
      </div>

      {showUpload && (
        <div className="pb-4 pl-12">
          <LifelistUpload
            onImport={handleImport}
            isPending={listMutation.isPending}
            hint={p.count ? "Uploading a new file replaces this list." : "Upload an eBird CSV export to use for this trip."}
            buttonLabel={p.count ? "Choose a new CSV file" : "Choose a CSV file"}
          />
        </div>
      )}
    </div>
  );
}
