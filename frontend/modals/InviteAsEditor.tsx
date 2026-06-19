import React from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Header, Body, Footer, useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import useMutation from "hooks/useMutation";
import Button from "components/Button";
import Input from "components/Input";

type Props = {
  participantId: string;
  name?: string;
};

export default function InviteAsEditor({ participantId, name }: Props) {
  const { close } = useModal();
  const { trip } = useTrip();
  const queryClient = useQueryClient();
  const [email, setEmail] = React.useState("");

  const mutation = useMutation({
    url: `/trips/${trip?._id}/participants`,
    method: "POST",
    onSuccess: () => {
      toast.success("Invite sent");
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}/participants`] });
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
      close();
    },
  });

  const canSubmit = !!email.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    mutation.mutate({ type: "invite", email: email.trim(), upgradeId: participantId });
  };

  return (
    <>
      <Header>Invite as editor</Header>
      <Body className="min-h-0">
        <p className="mb-4 text-sm text-gray-500">Send {name || "this person"} an email to join as an editor.</p>
        <label className="block pb-2">
          <span className="block text-sm font-medium text-gray-700 mb-1.5">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="friend@example.com"
            autoFocus
          />
        </label>
      </Body>
      <Footer>
        <div className="flex justify-end gap-2 w-full">
          <Button onClick={close} color="grayOutline" disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Sending..." : "Send invite"}
          </Button>
        </div>
      </Footer>
    </>
  );
}
