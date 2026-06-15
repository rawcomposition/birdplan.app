import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import Input from "components/Input";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import ParticipantRow from "components/ParticipantRow";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import useTripLifelist from "hooks/useTripLifelist";
import { getReturnLabel } from "lib/helpers";

export default function TripParticipants() {
  const router = useRouter();
  const { trip, is404, canEdit, participants } = useTrip();
  const { open } = useModal();
  const { mode, count } = useTripLifelist(trip);
  const linkRef = React.useRef<HTMLInputElement>(null);

  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;
  const isNew = router.query.new === "1";
  const backHref = returnTo || `/${trip?._id}`;
  const backLabel = returnTo ? getReturnLabel(returnTo) : "trip";
  const shareLink = `${process.env.NEXT_PUBLIC_URL}/${trip?._id}`;
  const handleLinkFocus = () => linkRef.current?.select();

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Participants | BirdPlan.app</title>
      </Head>

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {(returnTo || !isNew) && (
          <Link
            href={backHref}
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

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-4 sm:px-5 mb-4">
            {participants == null ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Icon name="loading" className="animate-spin" /> Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">No participants yet.</p>
            ) : (
              participants.map((p, i) => (
                <ParticipantRow key={p._id} participant={p} index={i} />
              ))
            )}
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => open("addParticipant")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
            >
              <Icon name="plus" className="text-xs" /> Add a participant
            </button>
          )}

          {mode === "customShared" && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold tabular-nums">{count.toLocaleString()} species</span> seen by everyone
              </p>
              <p className="mt-1 text-sm text-gray-500">Targets are the species at least one of you still needs.</p>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2 text-gray-700">View-only link</h3>
            <Input type="text" name="link" value={shareLink} readOnly ref={linkRef} onFocus={handleLinkFocus} />
          </div>

          <div className="flex mt-8">
            <Button href={backHref} color="primary" className="inline-flex items-center ml-auto">
              Done
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
