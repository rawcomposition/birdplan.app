import React from "react";
import { useSearchParams } from "react-router-dom";
import Header from "components/Header";
import Icon from "components/Icon";
import Button from "components/Button";
import Card from "components/Card";
import Field from "components/Field";
import { Input } from "components/ui/input";
import FormPage from "components/FormPage";
import NotFound from "components/NotFound";
import ParticipantRow from "components/ParticipantRow";
import { useTrip } from "hooks/useTrip";
import { useModal } from "stores/modals";
import { getReturnLabel } from "lib/helpers";

export default function TripParticipants() {
  const [searchParams] = useSearchParams();
  const { trip, is404, canEdit, participants } = useTrip();
  const { open } = useModal();
  const linkRef = React.useRef<HTMLInputElement>(null);

  const returnTo = searchParams.get("returnTo");
  const isNew = searchParams.get("new") === "1";
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
      back={returnTo || !isNew ? { to: backHref, label: `Back to ${backLabel}` } : undefined}
    >
      <Card className="mb-4 px-4 sm:px-5">
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
        <button
          type="button"
          onClick={() => open("addParticipant")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
        >
          <Icon name="plus" className="text-xs" /> Add a participant
        </button>
      )}

      <Field label="View-only link" className="mt-8">
        <Input name="link" value={shareLink} readOnly ref={linkRef} onFocus={handleLinkFocus} />
      </Field>

      <div className="mt-8 flex">
        <Button href={backHref} color="pillPrimary" size="pill" className="ml-auto">
          Done
        </Button>
      </div>
    </FormPage>
  );
}
