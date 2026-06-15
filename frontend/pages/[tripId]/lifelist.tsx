import React from "react";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { IntersectionList } from "@birdplan/shared";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import LifelistUpload from "components/LifelistUpload";
import { useTrip } from "providers/trip";
import { useProfile } from "providers/profile";
import { useModal } from "providers/modals";
import useTripLifelist, { TripLifelistMode } from "hooks/useTripLifelist";
import useMutation from "hooks/useMutation";

export default function TripLifelist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trip, is404, canEdit } = useTrip();
  const { lifelist: globalList } = useProfile();
  const { open } = useModal();
  const { mode, intersectionLists } = useTripLifelist(trip);

  // We land here straight after creating a trip; in that flow the action is "continue",
  // otherwise the user came from the trip to manage and the action is "back".
  const isOnboarding = router.query.new === "1";

  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;
  const backHref = returnTo || `/${trip?._id}`;
  const backLabel = returnTo?.endsWith("/settings") ? "settings" : "trip";

  // The radio reflects the saved mode, but the user can preview a not-yet-committed option
  // (e.g. reveal the upload area) before any list actually exists.
  const [pendingMode, setPendingMode] = React.useState<TripLifelistMode | null>(null);
  const selectedMode = pendingMode ?? mode;

  const invalidateTrip = () => queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });

  const importMutation = useMutation({
    url: `/trips/${trip?._id}/lifelist`,
    method: "PUT",
    onMutate: () => toast.loading("Importing custom list...", { id: "trip-lifelist" }),
    onSettled: () => toast.dismiss("trip-lifelist"),
    onSuccess: () => {
      toast.success("Custom list imported");
      setPendingMode(null);
      invalidateTrip();
    },
  });

  const revertMutation = useMutation({
    url: `/trips/${trip?._id}/lifelist`,
    method: "DELETE",
    onSuccess: () => {
      toast.success("Now using your World life list");
      setPendingMode(null);
      invalidateTrip();
    },
  });

  const selectWorld = () => {
    if (mode === "world") return setPendingMode(null);
    setPendingMode("world"); // move the radio immediately; cleared once the refetch lands
    revertMutation.mutate({});
  };

  const selectSingle = () => setPendingMode(mode === "customSingle" ? null : "customSingle");
  const selectShared = () => setPendingMode(mode === "customShared" ? null : "customShared");

  const handleSingleImport = (sciNames: string[]) => {
    importMutation.mutate({ sciNames });
  };

  const openAddListDialog = () => open("addSharedList");

  const hasSingle = mode === "customSingle";
  const singleCount = hasSingle ? trip?.customLifelist?.length || 0 : 0;
  const singleUpdatedAt = hasSingle ? trip?.customLifelistUpdatedAt : null;
  const sharedCount = trip?.customLifelist?.length || 0;

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
              name="trip-lifelist"
              checked={selectedMode === "customSingle"}
              disabled={!canEdit}
              onSelect={selectSingle}
              title="Custom"
              description="Applies only to this trip — your World life list stays untouched."
            />
            {selectedMode === "customSingle" && (
              <AccordionPanel>
                {hasSingle && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-800 tabular-nums">
                      {singleCount.toLocaleString()} species
                    </span>
                    {singleUpdatedAt ? ` · updated ${new Date(singleUpdatedAt).toLocaleDateString()}` : ""}
                  </p>
                )}
                {canEdit ? (
                  <LifelistUpload
                    onImport={handleSingleImport}
                    isPending={importMutation.isPending}
                    hint={hasSingle ? "Uploading a new file replaces this list." : "Upload an eBird CSV export to use for this trip."}
                    buttonLabel={hasSingle ? "Choose a new CSV file" : "Choose a CSV file"}
                  />
                ) : (
                  !hasSingle && <p className="text-sm text-gray-500">No custom list has been uploaded for this trip.</p>
                )}
              </AccordionPanel>
            )}

            <div className="h-px bg-gray-100" />

            <OptionCard
              name="trip-lifelist"
              checked={selectedMode === "customShared"}
              disabled={!canEdit}
              onSelect={selectShared}
              title="Shared"
              description="Combine several birders' lists — a species stays a target until everyone has seen it."
            />
            {selectedMode === "customShared" && (
              <AccordionPanel>
                {intersectionLists.length > 0 && (
                  <div className="mb-1">
                    {intersectionLists.map((list, i) => (
                      <MemberRow key={list._id} tripId={trip!._id} list={list} index={i} canEdit={canEdit} />
                    ))}
                  </div>
                )}

                {canEdit ? (
                  <button
                    type="button"
                    onClick={openAddListDialog}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 text-sm font-semibold text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
                  >
                    <Icon name="plus" className="text-xs" /> Add a list
                  </button>
                ) : (
                  intersectionLists.length === 0 && (
                    <p className="text-sm text-gray-500">No shared lists have been added for this trip.</p>
                  )
                )}

                {intersectionLists.length > 0 && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold tabular-nums">{sharedCount.toLocaleString()} species</span> seen by
                      everyone
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Targets are the species at least one of you still needs.
                    </p>
                  </div>
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

// Repeating palette for member avatars — keyed by row position, nothing fancy.
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-600",
];

type MemberRowProps = {
  tripId: string;
  list: IntersectionList;
  index: number;
  canEdit: boolean;
};

function MemberRow({ tripId, list, index, canEdit }: MemberRowProps) {
  const queryClient = useQueryClient();
  const baseUrl = `/trips/${tripId}/lifelist/intersection/lists/${list._id}`;

  const removeMutation = useMutation({
    url: baseUrl,
    method: "DELETE",
    onSuccess: () => {
      toast.success("List removed");
      queryClient.invalidateQueries({ queryKey: [`/trips/${tripId}`] });
    },
  });

  const handleRemove = () => {
    if (!confirm(`Remove "${list.name}" from this trip's shared list?`)) return;
    removeMutation.mutate({});
  };

  const initial = list.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-gray-100 last:border-0">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          AVATAR_COLORS[index % AVATAR_COLORS.length]
        }`}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{list.name}</p>
        <p className="text-xs text-gray-500 tabular-nums">{list.codes.length.toLocaleString()} species</p>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={removeMutation.isPending}
          title="Remove"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
        >
          <Icon name="xMark" className="text-sm" />
        </button>
      )}
    </div>
  );
}
