import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer, useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import LifelistEditor from "components/LifelistEditor";
import LifelistField from "components/LifelistField";
import useLifelistMode from "hooks/useLifelistMode";
import Button from "components/Button";
import Input from "components/Input";
import { withReturnTo } from "lib/helpers";

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

  const clearMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${participantId}/list`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("List removed");
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
  const handleRemove = () => {
    if (!confirm(`Remove ${p?.name || "this participant"}'s life list?`)) return;
    clearMutation.mutate(undefined);
  };

  const isBusy = listMutation.isPending || clearMutation.isPending;

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
    : "Attach a life list";

  const listSection = (
    <LifelistField
      hasList={p.hasList}
      count={p.count}
      onImport={handleImport}
      onRemove={handleRemove}
      disabled={isBusy}
    />
  );

  return (
    <>
      <Header>{title}</Header>
      <Body className="min-h-0 pb-5">
        {isSelf && trip && <LifelistEditor trip={trip} mode={lifelistMode} />}

        {isSelf && isGroup && !asPath.startsWith(`/${trip?._id}/participants`) && (
          <Link
            href={withReturnTo(`/${trip?._id}/participants`, asPath)}
            onClick={close}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-link"
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
            {listSection}
          </div>
        )}

        {isPending && isOwner && (
          <div className="space-y-3">
            {listSection}
            <p className="text-xs text-gray-500">
              They can change this once they accept the invite.
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
