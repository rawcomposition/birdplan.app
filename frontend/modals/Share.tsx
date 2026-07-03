import React from "react";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import Field from "components/Field";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import toast from "react-hot-toast";
import { Check, Copy, Globe, Lock, UserPlus } from "lucide-react";

export default function Share() {
  const { open, close } = useModal();
  const { trip, participants } = useTrip();
  const [copied, setCopied] = React.useState(false);
  const isPublic = !!trip?.isPublic;
  const shareLink = `${import.meta.env.VITE_URL}/${trip?._id}`;

  const privacyMutation = useTripMutation<{ isPublic: boolean }>({
    url: `/trips/${trip?._id}/privacy`,
    method: "PATCH",
    updateCache: (old, input) => ({ ...old, isPublic: input.isPublic }),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const PrivacyIcon = isPublic ? Globe : Lock;

  return (
    <>
      <Header>Share Trip</Header>
      <Body className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <PrivacyIcon className="size-5 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-800">{isPublic ? "Public trip" : "Private trip"}</p>
              <p className="text-sm text-gray-500">
                {isPublic ? "Anyone with the link can view this trip." : "Only participants can view this trip."}
              </p>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(checked) => privacyMutation.mutate({ isPublic: checked })}
            aria-label="Public trip"
          />
        </div>
        <Field
          label="View-only link"
          help={!isPublic && "This link only works for participants while the trip is private."}
        >
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareLink}
              onFocus={(e) => e.target.select()}
              className="h-10 w-full min-w-0 rounded-lg border border-border bg-muted/50 px-3 text-sm text-gray-700 outline-none focus-visible:border-ring"
            />
            <Button variant="outline-white" size="icon-lg" onClick={handleCopy} aria-label="Copy link">
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </Field>
        <Field
          label="Participants"
          rightButton={
            <Button variant="link" href={`/${trip?._id}/participants`} onClick={close} className="text-sm">
              Manage
            </Button>
          }
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              {participants?.length
                ? `${participants.length} ${participants.length === 1 ? "person" : "people"} on this trip.`
                : "It's just you so far."}{" "}
              Invite others to plan together and compare targets.
            </p>
            <Button variant="outline-white" size="sm" onClick={() => open("addParticipant")}>
              <UserPlus className="size-4" />
              Invite
            </Button>
          </div>
        </Field>
      </Body>
      <Footer>
        <div className="flex justify-end w-full">
          <Button onClick={close} variant="secondary">
            Done
          </Button>
        </div>
      </Footer>
    </>
  );
}
