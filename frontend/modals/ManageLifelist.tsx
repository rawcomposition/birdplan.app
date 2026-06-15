import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer, useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import LifelistUpload from "components/LifelistUpload";
import LifelistEditor from "components/LifelistEditor";
import useLifelistMode from "hooks/useLifelistMode";
import Button from "components/Button";
import Input from "components/Input";

type Props = {
  participantId: string;
};

export default function ManageLifelist({ participantId }: Props) {
  const { close } = useModal();
  const { trip, isOwner, canEdit, participants } = useTrip();
  const { asPath } = useRouter();
  const queryClient = useQueryClient();

  const p = participants?.find((x) => x._id === participantId);

  const isSelf = !!p?.isMe;
  const isPending = p?.status === "pending";
  const isNameOnly = !!p && !p.uid && !isPending;
  const isGroup = (participants?.length ?? 0) > 1;

  const [nameDraft, setNameDraft] = React.useState(p?.name || "");
  const lifelistMode = useLifelistMode(trip);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
  };

  const listMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${participantId}/list`,
    method: "PUT",
    onSuccess: () => {
      toast.success("List updated");
      invalidate();
    },
  });

  const renameMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${participantId}`,
    method: "PATCH",
    onSuccess: () => {
      toast.success("Participant updated");
      invalidate();
    },
  });

  if (!p) return null;

  const handleImport = (sciNames: string[]) => listMutation.mutate({ sciNames });

  const nameDirty = isNameOnly && !!nameDraft.trim() && nameDraft.trim() !== p?.name;
  const modeDirty = isSelf && lifelistMode.isDirty;
  const hasPendingChange = nameDirty || modeDirty;

  const handleDone = () => {
    if (modeDirty) lifelistMode.save();
    if (nameDirty) renameMutation.mutate({ name: nameDraft.trim() });
    close();
  };

  const title = isSelf
    ? "Change your life list"
    : isNameOnly
    ? `Edit ${p.name || "participant"}`
    : p.hasList
    ? "Replace life list"
    : "Attach a life list";
  const uploadHint = p.hasList
    ? "Uploading a new file replaces this list."
    : "Upload an eBird CSV export to use for this trip.";
  const uploadLabel = p.hasList ? "Choose a new CSV file" : "Choose a CSV file";

  return (
    <>
      <Header>{title}</Header>
      <Body className="min-h-0 pb-5">
        {isSelf && trip && <LifelistEditor trip={trip} mode={lifelistMode} />}

        {isSelf && isGroup && (
          <Link
            href={`/${trip?._id}/participants?returnTo=${encodeURIComponent(asPath)}`}
            onClick={close}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600"
          >
            Manage other participants&apos; life lists →
          </Link>
        )}

        {isNameOnly && canEdit && (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Name</span>
              <Input
                type="text"
                value={nameDraft}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameDraft(e.target.value)}
              />
            </label>
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Life list</span>
              <LifelistUpload variant="compact" onImport={handleImport} isPending={listMutation.isPending} hint={uploadHint} buttonLabel={uploadLabel} />
            </div>
          </div>
        )}

        {isPending && isOwner && (
          <div className="space-y-3">
            <LifelistUpload variant="compact" onImport={handleImport} isPending={listMutation.isPending} hint={uploadHint} buttonLabel={uploadLabel} />
            <p className="text-xs text-gray-500">
              They can switch to their World list or replace this after they accept the invite.
            </p>
          </div>
        )}
      </Body>
      <Footer>
        <div className="flex justify-end w-full">
          <Button onClick={handleDone} color="primary">
            {hasPendingChange ? "Save" : "Done"}
          </Button>
        </div>
      </Footer>
    </>
  );
}
