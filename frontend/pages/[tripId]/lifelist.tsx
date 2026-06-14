import React from "react";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import LifelistUpload from "components/LifelistUpload";
import { useTrip } from "providers/trip";
import { useProfile } from "providers/profile";
import useMutation from "hooks/useMutation";

export default function TripLifelist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trip, is404, canEdit } = useTrip();
  const { lifelist: globalList } = useProfile();

  // We land here straight after creating a trip; in that flow the action is "continue",
  // otherwise the user came from the trip to manage and the action is "back".
  const isOnboarding = router.query.new === "1";

  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;
  const backHref = returnTo || `/${trip?._id}`;
  const backLabel = returnTo?.endsWith("/settings") ? "settings" : "trip";

  const hasCustom = trip?.customLifelist != null;
  const customCount = trip?.customLifelist?.length || 0;
  const updatedAt = trip?.customLifelistUpdatedAt;

  // When the trip is on the global list, let the user reveal the upload area
  // before any custom list actually exists.
  const [pendingCustom, setPendingCustom] = React.useState(false);
  const customSelected = hasCustom || pendingCustom;

  const importMutation = useMutation({
    url: `/trips/${trip?._id}/lifelist`,
    method: "PUT",
    onMutate: () => toast.loading("Importing custom list...", { id: "trip-lifelist" }),
    onSettled: () => toast.dismiss("trip-lifelist"),
    onSuccess: () => {
      toast.success("Custom list imported");
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
  });

  const revertMutation = useMutation({
    url: `/trips/${trip?._id}/lifelist`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("Now using your World life list");
      setPendingCustom(false);
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
  });

  const selectGlobal = () => {
    if (hasCustom) {
      if (!confirm("Use your World life list for this trip? The uploaded custom list will be deleted.")) return;
      revertMutation.mutate({});
    } else {
      setPendingCustom(false);
    }
  };

  const selectCustom = () => {
    if (!hasCustom) setPendingCustom(true);
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Trip Life List | BirdPlan.app</title>
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
            <Icon name="feather" className="text-2xl text-lime-600" /> Trip Life List
          </h1>
          <p className="text-gray-500 mb-8">
            Pick the list this trip checks against. Any species you haven&apos;t recorded on it becomes a target.
          </p>

          <div
            role="radiogroup"
            aria-label="Which list should this trip target against?"
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-4"
          >
            <OptionCard
              name="trip-lifelist"
              checked={!customSelected}
              disabled={!canEdit}
              onSelect={selectGlobal}
              title="World life list"
              description={`${(globalList?.length || 0).toLocaleString()} species you've recorded worldwide`}
            />
            {!customSelected && (
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
              name="trip-lifelist"
              checked={customSelected}
              disabled={!canEdit}
              onSelect={selectCustom}
              title="Custom list for this trip"
              description="Applies only to this trip — your World life list stays untouched."
            />
            {customSelected && (
              <AccordionPanel>
                {hasCustom && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-800 tabular-nums">
                      {customCount.toLocaleString()} species
                    </span>
                    {updatedAt ? ` · updated ${new Date(updatedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
                {canEdit ? (
                  <LifelistUpload
                    onImport={(sciNames) => importMutation.mutate({ sciNames })}
                    isPending={importMutation.isPending}
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
  name: string;
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: React.ReactNode;
};

function OptionCard({ name, checked, disabled, onSelect, title, description }: OptionCardProps) {
  return (
    <label
      className={`flex items-start gap-3.5 p-5 transition-colors ${
        disabled ? "" : "cursor-pointer hover:bg-gray-50"
      } ${checked ? "bg-blue-50/50" : ""}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
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
