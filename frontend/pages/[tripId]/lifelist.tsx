import React from "react";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { ParticipantListMode } from "@birdplan/shared";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import LifelistUpload from "components/LifelistUpload";
import { useTrip } from "providers/trip";
import { useProfile } from "providers/profile";
import useTripLifelist from "hooks/useTripLifelist";
import useMutation from "hooks/useMutation";

export default function TripLifelist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trip, is404, canEdit } = useTrip();
  const { lifelist: globalList } = useProfile();
  const { myCodes } = useTripLifelist(trip);

  // We land here straight after creating a trip; in that flow the action is "continue",
  // otherwise the user came from the trip to manage and the action is "back".
  const isOnboarding = router.query.new === "1";
  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;
  const backHref = returnTo || `/${trip?._id}`;
  const backLabel = returnTo?.endsWith("/settings") ? "settings" : "trip";

  const viewerId = trip?.viewer?.participantId;
  const savedMode: ParticipantListMode = trip?.viewer?.listMode ?? "world";

  // The radio reflects my saved mode, but I can preview Custom (revealing the upload area)
  // before the mode switch round-trips.
  const [pendingMode, setPendingMode] = React.useState<ParticipantListMode | null>(null);
  const selectedMode = pendingMode ?? savedMode;

  const invalidateTrip = () => queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });

  const modeMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${viewerId}/mode`,
    method: "PATCH",
    onSuccess: () => {
      setPendingMode(null);
      invalidateTrip();
    },
  });

  const listMutation = useMutation({
    url: `/trips/${trip?._id}/participants/${viewerId}/list`,
    method: "PUT",
    onMutate: () => toast.loading("Importing custom list...", { id: "trip-lifelist" }),
    onSettled: () => toast.dismiss("trip-lifelist"),
    onSuccess: () => {
      toast.success("Custom list imported");
      setPendingMode(null);
      invalidateTrip();
    },
  });

  const selectWorld = () => {
    if (savedMode === "world") return setPendingMode(null);
    setPendingMode("world");
    modeMutation.mutate({ listMode: "world" });
  };

  // Just reveal the upload area — don't persist "custom" until a file is actually uploaded
  // (the PUT /list call sets listMode to custom on the server).
  const selectCustom = () => setPendingMode("custom");

  const handleCustomImport = (sciNames: string[]) => listMutation.mutate({ sciNames });

  const hasCustom = savedMode === "custom";
  const customCount = hasCustom ? myCodes.length : 0;
  const customUpdatedAt = hasCustom ? trip?.viewer && trip?.customLifelistUpdatedAt : null;

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>My Trip List | BirdPlan.app</title>
      </Head>

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {!isOnboarding && (
          <Link
            href={backHref}
            className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
          >
            ← Back to {backLabel}
          </Link>
        )}
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            <Icon name="feather" className="text-2xl text-lime-600" /> My Trip List
          </h1>
          <p className="text-gray-500 mb-8">
            Pick the list this trip checks <span className="font-medium">your</span> targets against. Any species you
            haven&apos;t recorded on it becomes a target. To add other people, open{" "}
            <Link href={`/${trip?._id}/participants`} className="text-sky-600 font-medium">
              Participants
            </Link>
            .
          </p>

          <div
            role="radiogroup"
            aria-label="Which list should this trip target against for you?"
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4"
          >
            <OptionCard
              checked={selectedMode === "world"}
              disabled={!canEdit}
              onSelect={selectWorld}
              title="World life list"
              description={`${(globalList?.length || 0).toLocaleString()} species you've recorded worldwide`}
            />
            {selectedMode === "world" && (
              <AccordionPanel>
                <Link
                  href={`/import-lifelist?returnTo=${encodeURIComponent(`/${trip?._id}/lifelist`)}`}
                  className="text-sky-600 font-semibold text-sm"
                >
                  Manage your World life list →
                </Link>
              </AccordionPanel>
            )}

            <div className="h-px bg-gray-100" />

            <OptionCard
              checked={selectedMode === "custom"}
              disabled={!canEdit}
              onSelect={selectCustom}
              title="Custom"
              description="Applies only to this trip — your World life list stays untouched."
            />
            {selectedMode === "custom" && (
              <AccordionPanel>
                {hasCustom && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-800 tabular-nums">
                      {customCount.toLocaleString()} species
                    </span>
                    {customUpdatedAt ? ` · updated ${new Date(customUpdatedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
                {canEdit ? (
                  <LifelistUpload
                    onImport={handleCustomImport}
                    isPending={listMutation.isPending}
                    hint={hasCustom ? "Uploading a new file replaces this list." : "Upload an eBird CSV export to use for this trip."}
                    buttonLabel={hasCustom ? "Choose a new CSV file" : "Choose a CSV file"}
                  />
                ) : (
                  !hasCustom && <p className="text-sm text-gray-500">No custom list has been uploaded for this trip.</p>
                )}
              </AccordionPanel>
            )}
          </div>

          <div className="flex">
            <Button href={backHref} color="primary" className="inline-flex items-center ml-auto">
              {isOnboarding ? "Continue to trip" : "Done"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}

type OptionCardProps = {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: React.ReactNode;
};

function OptionCard({ checked, disabled, onSelect, title, description }: OptionCardProps) {
  return (
    <label
      className={`flex items-start gap-3.5 p-5 transition-colors ${
        disabled ? "" : "cursor-pointer hover:bg-gray-50"
      } ${checked ? "bg-blue-50/50" : ""}`}
    >
      <input type="radio" name="trip-lifelist" checked={checked} disabled={disabled} onChange={onSelect} className="sr-only" />
      <span
        className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
          checked ? "border-blue-500" : "border-gray-300"
        }`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
      </span>
      <span>
        <span className="block text-lg font-bold text-gray-800">{title}</span>
        <span className="block text-sm text-gray-500">{description}</span>
      </span>
    </label>
  );
}

function AccordionPanel({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-gray-100 px-5 pt-4 pb-5">{children}</div>;
}
