import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Input from "components/Input";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import clsx from "clsx";
import useMutation from "hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import InviteRow from "components/InviteRow";

export default function Share() {
  const linkRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { close } = useModal();
  const { trip, invites } = useTrip();
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    url: `/api/v1/invites`,
    method: "POST",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/trips/${trip?._id}/invites`] });
      formRef.current?.reset();
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.email.value;
    if (!email) return toast.error("Please enter an email address");
    if (!trip?._id) return toast.error("Trip not found");

    inviteMutation.mutate({ email, tripId: trip?._id });
  };

  const link = `${process.env.NEXT_PUBLIC_URL}/${trip?._id}`;

  const handleLinkFocus = () => {
    linkRef.current?.select();
  };

  return (
    <>
      <Header>Share Trip</Header>
      <Body>
        <h3 className="text-lg font-medium mb-2">View-only Link</h3>
        <Input type="text" name="link" value={link} readOnly ref={linkRef} onFocus={handleLinkFocus} />
        <h3 className={clsx("text-lg font-medium mt-4", !invites?.length && "mb-4")}>Invite Editors</h3>
        {!!invites?.length && (
          <ul className="mb-6 divide-y">
            {invites.map((invite) => (
              <InviteRow key={invite._id} invite={invite} />
            ))}
          </ul>
        )}
        <form className="flex gap-2 w-full mb-4" onSubmit={handleSubmit} ref={formRef}>
          <Input type="email" name="email" placeholder="Email" autoFocus />
          <Button type="submit" color="primary" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending ? "..." : "Invite"}
          </Button>
        </form>
        <Button color="gray" className="mb-1 mt-2" onClick={close}>
          Done
        </Button>
      </Body>
    </>
  );
}
