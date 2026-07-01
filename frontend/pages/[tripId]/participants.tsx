import React from "react";
import { useSearchParams } from "react-router-dom";
import Header from "components/Header";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import Card from "components/Card";
import Field from "components/Field";
import { Input } from "components/ui/input";
import FormPage from "components/FormPage";
import NotFound from "components/NotFound";
import ParticipantRow from "components/ParticipantRow";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import { getReturnLabel } from "lib/helpers";
import { Flow } from "lib/enums";

export default function TripParticipants() {
  const [searchParams] = useSearchParams();
  const { trip, is404, canEdit, participants } = useTrip();
  const { open } = useModal();
  const linkRef = React.useRef<HTMLInputElement>(null);

  const returnTo = searchParams.get("returnTo");
  const isCreate = searchParams.get("from") === Flow.Create;
  const backHref = returnTo || `/${trip?._id}`;
  const backLabel = returnTo ? getReturnLabel(returnTo) : "trip";
  const shareLink = `${import.meta.env.VITE_URL}/${trip?._id}`;
  const handleLinkFocus = () => linkRef.current?.select();

  if (is404) return <NotFound />;

  return (
    <FormPage
      title="Participants"
      subtitle="Manage trip participants and life lists."
      documentTitle="Participants | BirdPlan.app"
      header={<Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />}
      back={returnTo || !isCreate ? { to: backHref, label: `Back to ${backLabel}` } : undefined}
    >
      <Card className="mb-4 rounded-2xl px-4 sm:px-5">
        {participants == null ? (
          <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
            <Icon name="loading" className="animate-spin" /> Loading participants...
          </div>
        ) : participants.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">No participants yet.</p>
        ) : (
          participants.map((p) => <ParticipantRow key={p._id} participant={p} />)
        )}
      </Card>

      {canEdit && (
        <Button
          variant="outline"
          onClick={() => open("addParticipant")}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm text-primary"
        >
          <Icon name="plus" className="text-xs" /> Add a participant
        </Button>
      )}

      <Card className="mt-8 rounded-2xl p-5 sm:p-6">
        <Field label="View-only link">
          <Input name="link" value={shareLink} readOnly ref={linkRef} onFocus={handleLinkFocus} />
        </Field>
      </Card>

      <div className="mt-8 flex">
        <Button href={backHref} variant="default" size="lg" className="ml-auto">
          {isCreate ? "Continue" : "Done"}
        </Button>
      </div>
    </FormPage>
  );
}
