import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import Card from "components/Card";
import Input from "components/Input";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import ParticipantRow from "components/ParticipantRow";
import { useTrip } from "providers/trip";
import { useModal } from "providers/modals";
import useTripLifelist from "hooks/useTripLifelist";
import { getReturnLabel } from "lib/helpers";
import { lifelistToCsv } from "lib/lifelistCsv";

export default function TripParticipants() {
  const router = useRouter();
  const { trip, is404, canEdit, participants } = useTrip();
  const { open } = useModal();
  const { isGroup, count, lifelist } = useTripLifelist(trip);
  const linkRef = React.useRef<HTMLInputElement>(null);

  const { data: taxonomy } = useQuery<{ name: string; sciName: string; code: string }[]>({
    queryKey: ["/taxonomy?sciName=1"],
    enabled: isGroup,
  });

  const handleDownload = () => {
    if (!taxonomy) {
      toast.error("Taxonomy is still loading, please try again");
      return;
    }
    const byCode = new Map(taxonomy.map((it) => [it.code, it]));
    const species = lifelist
      .map((code) => byCode.get(code))
      .filter((it): it is NonNullable<typeof it> => !!it)
      .map((it) => ({ comName: it.name, sciName: it.sciName }));
    const csv = lifelistToCsv(species);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip?.name ? `${trip.name}-` : ""}group-life-list.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <p className="text-gray-500 mb-8">Manage trip participants and life lists.</p>

          <Card className="px-4 sm:px-5 mb-4">
            {participants == null ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Icon name="loading" className="animate-spin" /> Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">No participants yet.</p>
            ) : (
              participants.map((p, i) => <ParticipantRow key={p._id} participant={p} index={i} />)
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

          {isGroup && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold tabular-nums">Group Life List</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    There are <span className="font-semibold tabular-nums">{count.toLocaleString()}</span> species that
                    all participants have seen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100/70"
                  title="Download as eBird CSV"
                >
                  <Icon name="download" /> Download
                </button>
              </div>
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
