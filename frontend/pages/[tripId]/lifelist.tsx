import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import Header from "components/Header";
import Footer from "components/Footer";
import Icon from "components/Icon";
import Button from "components/Button";
import Field from "components/Field";
import RegionSelect from "components/RegionSelect";
import NotFound from "components/NotFound";
import LoginModal from "components/LoginModal";
import { useTrip } from "providers/trip";
import { useProfile } from "providers/profile";
import useMutation from "hooks/useMutation";
import { Option } from "lib/types";

const portalTarget = () => (typeof document !== "undefined" ? document.body : null);

export default function TripLifelist() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trip, is404, canEdit } = useTrip();
  const { lifelist: globalList } = useProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Region picker only builds a convenient eBird download URL.
  const [useWorld, setUseWorld] = React.useState(false);
  const [country, setCountry] = React.useState<Option | undefined>();
  const [state, setState] = React.useState<Option | undefined>();
  const [county, setCounty] = React.useState<Option | undefined>();

  const regionScope = county?.value || state?.value || country?.value || "";
  const downloadScope = useWorld ? "world" : regionScope;
  const downloadReady = useWorld || !!regionScope;

  const hasCustom = trip?.customLifelist != null;
  const customCount = trip?.customLifelist?.length || 0;
  const updatedAt = trip?.customLifelistUpdatedAt;

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
      toast.success("Reverted to your global life list");
      queryClient.invalidateQueries({ queryKey: [`/trips/${trip?._id}`] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: async function (results: any) {
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]);
          fileInputRef.current?.value && (fileInputRef.current.value = "");
          importMutation.mutate({ sciNames });
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  if (is404) return <NotFound />;

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Trip Life List | BirdPlan.app</title>
      </Head>

      <Header title={trip?.name || ""} parent={{ title: "Trips", href: "/trips" }} />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Link
          href={`/${trip?._id}`}
          className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
        >
          ← Back to trip
        </Link>
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            <Icon name="feather" className="text-2xl text-lime-600" /> Trip Life List
          </h1>
          <p className="text-gray-500 mb-8">
            Choose which life list this trip targets against. By default it uses your global life list.
          </p>

          {/* Current basis */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-1">Targeting against</p>
            {hasCustom ? (
              <>
                <p className="text-xl font-bold text-gray-800">
                  Custom list{" "}
                  <span className="text-base font-medium text-gray-500 tabular-nums">
                    ({customCount.toLocaleString()} species
                    {updatedAt ? ` · updated ${new Date(updatedAt).toLocaleDateString()}` : ""})
                  </span>
                </p>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm("Revert this trip to your global life list?")) return;
                      revertMutation.mutate({});
                    }}
                    disabled={revertMutation.isPending}
                    className="mt-3 text-sky-600 font-medium text-sm"
                  >
                    Use my global life list instead
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-gray-800">
                  Your global life list{" "}
                  <span className="text-base font-medium text-gray-500 tabular-nums">
                    ({globalList?.length?.toLocaleString() || 0} species)
                  </span>
                </p>
                <Link href="/import-lifelist" className="mt-3 inline-block text-sky-600 font-medium text-sm">
                  Manage your global life list
                </Link>
              </>
            )}
          </div>

          {canEdit && (
            <>
              <h2 className="text-lg font-medium text-gray-700 mb-3">
                {hasCustom ? "Replace the custom list" : "Use a custom list for this trip"}
              </h2>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
                <h3 className="text-base font-medium mb-4 text-gray-700">1. Choose a region to download</h3>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setUseWorld(true)}
                    aria-pressed={useWorld}
                    className={`h-9 px-4 rounded-full border text-sm font-medium ${
                      useWorld ? "border-lime-300 bg-lime-50 text-lime-800" : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    World
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseWorld(false)}
                    aria-pressed={!useWorld}
                    className={`h-9 px-4 rounded-full border text-sm font-medium ${
                      !useWorld ? "border-lime-300 bg-lime-50 text-lime-800" : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    Specific region
                  </button>
                </div>
                {!useWorld && (
                  <div className="space-y-3">
                    <Field label="Country">
                      <RegionSelect
                        type="country"
                        parent="world"
                        value={country}
                        onChange={(opt: any) => {
                          setCountry(opt || undefined);
                          setState(undefined);
                          setCounty(undefined);
                        }}
                        menuPortalTarget={portalTarget()}
                        isClearable
                      />
                    </Field>
                    {country && (
                      <Field label="State/Province" isOptional>
                        <RegionSelect
                          type="subnational1"
                          parent={country.value}
                          value={state}
                          onChange={(opt: any) => {
                            setState(opt || undefined);
                            setCounty(undefined);
                          }}
                          menuPortalTarget={portalTarget()}
                          isClearable
                        />
                      </Field>
                    )}
                    {state && (
                      <Field label="County" isOptional>
                        <RegionSelect
                          type="subnational2"
                          parent={state.value}
                          value={county}
                          onChange={(opt: any) => setCounty(opt || undefined)}
                          menuPortalTarget={portalTarget()}
                          isClearable
                        />
                      </Field>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
                <h3 className="text-base font-medium mb-1 text-gray-700">2. Download from eBird</h3>
                <p className="text-sm text-gray-600 mb-4">Export that region&apos;s life list as a CSV from eBird.</p>
                <Button
                  href={`https://ebird.org/lifelist?r=${downloadScope || "world"}&time=life&fmt=csv`}
                  target="_blank"
                  color="primary"
                  size="sm"
                  disabled={!downloadReady}
                  className="inline-flex items-center gap-2"
                >
                  <Icon name="download" /> Download Life List
                </Button>
                {!downloadReady && <p className="text-sm text-gray-500 mt-2">Pick a region above first.</p>}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
                <h3 className="text-base font-medium mb-1 text-gray-700">3. Upload the file</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This list is used only for this trip; your global life list is unchanged.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  disabled={!downloadReady}
                  className="text-xs"
                  onChange={handleFileUpload}
                />
              </div>
            </>
          )}

          <div className="flex">
            <Button href={`/${trip?._id}`} color="gray" className="inline-flex items-center ml-auto">
              Continue to trip
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
