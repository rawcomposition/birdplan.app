import React from "react";
import { Header, Body, Footer } from "components/Modal";
import { useModal } from "stores/modals";
import { Button } from "components/ui/button";
import { Switch } from "components/ui/switch";
import Field from "components/Field";
import { useTrip } from "hooks/useTrip";
import useTripMutation from "hooks/useTripMutation";
import Avatar from "components/Avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";
import { avatarFromParticipant } from "lib/avatar";
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
            <PrivacyIcon className="size-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground">{isPublic ? "Public trip" : "Private trip"}</p>
              <p className="text-sm text-muted-foreground">
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
              className="h-10 w-full min-w-0 rounded-lg border border-border bg-muted/50 px-3 text-sm text-secondary-foreground outline-none focus-visible:border-ring"
            />
            <Button
              variant="outline-white"
              size="icon-lg"
              onClick={handleCopy}
              aria-label="Copy link"
              className="shrink-0"
            >
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
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 -space-x-2">
              {participants?.slice(0, 5).map((p) => (
                <Tooltip key={p._id}>
                  <TooltipTrigger
                    render={
                      <span className="flex rounded-full ring-2 ring-card">
                        <Avatar user={avatarFromParticipant(p)} size={32} />
                      </span>
                    }
                  />
                  <TooltipContent>{p.name || p.email}</TooltipContent>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Invite participant"
                      onClick={() => open("addParticipant")}
                      className="flex size-8 items-center justify-center rounded-full border border-dashed border-border bg-card text-muted-foreground ring-2 ring-card transition-colors hover:border-ring hover:text-foreground"
                    />
                  }
                >
                  <UserPlus className="size-4" />
                </TooltipTrigger>
                <TooltipContent>Invite someone</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              {participants?.length && participants.length > 1
                ? `${participants.length} people on this trip.`
                : "It's just you so far. Invite others to plan together and compare targets."}
            </p>
          </div>
        </Field>
      </Body>
      <Footer>
        <Button onClick={close} variant="secondary">
          Done
        </Button>
      </Footer>
    </>
  );
}
