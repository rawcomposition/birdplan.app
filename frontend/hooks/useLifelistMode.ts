import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ParticipantListMode, Trip } from "@birdplan/shared";
import useMutation from "hooks/useMutation";

export default function useLifelistMode(trip: Trip | null | undefined) {
  const queryClient = useQueryClient();

  const viewerId = trip?.viewer?.participantId;
  const savedMode: ParticipantListMode = trip?.viewer?.listMode ?? "world";

  const [selectedMode, setSelectedMode] = React.useState<ParticipantListMode>(savedMode);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
  };

  const modeMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${viewerId}/mode`,
    method: "PATCH",
    onSuccess: invalidate,
  });

  const listMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${viewerId}/list`,
    method: "PUT",
    onSuccess: () => {
      toast.success("Custom list imported");
      setSelectedMode("custom");
      invalidate();
    },
  });

  const selectWorld = () => setSelectedMode("world");
  const selectCustom = () => setSelectedMode("custom");

  const handleCustomImport = (sciNames: string[]) => listMutation.mutate({ sciNames });

  const isDirty = selectedMode !== savedMode;
  const save = () => {
    if (isDirty) modeMutation.mutate({ listMode: selectedMode });
  };

  return {
    selectedMode,
    savedMode,
    selectWorld,
    selectCustom,
    handleCustomImport,
    listMutation,
    isDirty,
    save,
  };
}
