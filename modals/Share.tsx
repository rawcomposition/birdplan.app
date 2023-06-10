import React from "react";
import { Header, Body } from "providers/modals";
import Button from "components/Button";
import Input from "components/Input";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { auth } from "lib/firebase";
import clsx from "clsx";

export default function CreateTrip() {
  const [submitting, setSubmitting] = React.useState(false);
  const linkRef = React.useRef<HTMLInputElement>(null);
  const { close } = useModal();
  const { trip, invites, removeInvite } = useTrip();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    // @ts-ignore
    const email = form.email.value;
    if (!email) return toast.error("Please enter an email address");

    try {
      setSubmitting(true);
      const token = await auth.currentUser?.getIdToken();
      await fetch("/api/invite", {
        method: "post",
        body: JSON.stringify({ email, tripId: trip?.id }),
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
      });
      toast.success("Invite sent");
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create trip");
    }
    setSubmitting(false);
  };

  const link = `${process.env.NEXT_PUBLIC_URL}/${trip?.id}`;

  const handleLinkFocus = () => {
    linkRef.current?.select();
  };

  const removeUser = async (inviteId: string, uid?: string) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    await removeInvite(inviteId, uid);
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
            {invites.map(({ id, email, name, uid }) => (
              <li key={id} className="flex items-center justify-between mt-2 pt-2">
                <div className="flex flex-col text-sm text-gray-700">
                  {name && <span className="font-bold">{name}</span>}
                  <span>{email}</span>
                </div>
                <Button type="button" size="sm" onClick={() => removeUser(id, uid)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form className="flex gap-2 w-full mb-4" onSubmit={handleSubmit}>
          <Input type="email" name="email" placeholder="Email" autoFocus />
          <Button type="submit" color="primary" disabled={submitting}>
            {submitting ? "..." : "Invite"}
          </Button>
        </form>
        <Button color="gray" className="mb-1 mt-2" onClick={close}>
          Done
        </Button>
      </Body>
    </>
  );
}
