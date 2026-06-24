import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import Card from "components/Card";
import Input from "components/Input";
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
    <div className="flex flex-col h-full">
        <title>Participants | BirdPlan.app</title>

      <Header
        title={trip?.name || ""}
        parent={{ title: "Trips", href: "/trips" }}
      />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {(returnTo || !isNew) && (
          <Link
            to={backHref}
            className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
          >
            ← Back to {backLabel}
          </Link>
        )}
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            <Icon name="user" className="text-2xl text-lime-600" /> Participants
          </h1>
          <p className="text-gray-500 mb-8">
            Manage trip participants and life lists.
          </p>

          <Card className="px-4 sm:px-5 mb-4">
            {participants == null ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Icon name="loading" className="animate-spin" /> Loading
                participants...
              </div>
            ) : participants.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">No participants yet.</p>
            ) : (
              participants.map((p) => (
                <ParticipantRow key={p._id} participant={p} />
              ))
            )}
          </Card>

          {canEdit && (
            <button
              type="button"
              onClick={() => open("addParticipant")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
            >
              <Icon name="plus" className="text-xs" /> Add a participant
            </button>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              View-only link
            </h3>
            <Input
              type="text"
              name="link"
              value={shareLink}
              readOnly
              ref={linkRef}
              onFocus={handleLinkFocus}
            />
          </div>

          <div className="flex mt-8">
            <Button
              href={backHref}
              color="primary"
              className="inline-flex items-center ml-auto"
            >
              Done
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
