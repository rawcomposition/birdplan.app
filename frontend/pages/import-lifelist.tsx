import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Button from "components/Button";
import Footer from "components/Footer";
import Icon from "components/Icon";
import LoginModal from "components/LoginModal";
import Link from "next/link";
import useMutation from "hooks/useMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncSelect from "components/ReactSelectAsyncStyled";
import { Option } from "lib/types";
import Alert from "components/Alert";

const EBIRD_LIFELIST_URL = "https://ebird.org/lifelist?r=world&time=life&fmt=csv";

export default function ImportLifelist() {
  const [exceptionsValue, setExceptionsValue] = React.useState<Option[]>([]);
  const { lifelist, lifelistUpdatedAt, exceptions } = useProfile();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { tripId } = router.query;
  const redirectUrl = tripId ? `/${tripId}` : `/trips`;
  const hasList = !!lifelist?.length;

  const exceptionsString = exceptions?.join(",");

  const setExceptionsMutation = useMutation({
    url: "/profile",
    method: "PATCH",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/profile`] });
    },
  });

  const importMutation = useMutation({
    url: `/profile/lifelist`,
    method: "PUT",
    onMutate: () => {
      toast.loading("Importing life list...", { id: "import-lifelist" });
    },
    onSettled: () => {
      toast.dismiss("import-lifelist");
    },
    onSuccess: () => {
      toast.success("Life list imported");
      queryClient.invalidateQueries({ queryKey: [`/profile`] });
      router.push(redirectUrl);
    },
  });

  const {
    data: taxonomy,
    isLoading,
    isError,
    refetch,
  } = useQuery<{ name: string; code: string }[]>({
    queryKey: ["/taxonomy"],
  });

  React.useEffect(() => {
    if (!exceptionsString) return;
    const codes = exceptionsString.split(",");
    const value = codes.map((code) => {
      const taxon = taxonomy?.find((it) => it.code === code);
      return {
        label: taxon?.name || `Unknown (${code})`,
        value: taxon?.code!,
      };
    });
    setExceptionsValue(value);
  }, [exceptionsString, taxonomy]);

  const taxonomySearch = (input: string, callback: (options: Option[]) => void) => {
    const options = taxonomy?.filter((it) => it.name.toLowerCase().includes(input.toLowerCase()))?.slice(0, 25) || [];
    const formattedOptions = options.map((it) => ({ value: it.code, label: it.name }));
    callback(formattedOptions);
  };

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

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Your Life List | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Link
          href={redirectUrl}
          className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
        >
          ← Back to {tripId ? "trip" : "trips"}
        </Link>
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            <Icon name="feather" className="text-2xl text-lime-600" /> Your Life List
          </h1>
          <p className="text-gray-500 mb-8">
            Your global life list. Trips compute targets by subtracting it, unless a trip uses its own custom list.
          </p>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Species on your list</p>
                <p className="text-3xl font-bold text-gray-800 tabular-nums">
                  {hasList ? lifelist.length.toLocaleString() : "—"}
                </p>
              </div>
              {lifelistUpdatedAt && (
                <div className="text-right">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Last updated</p>
                  <p className="text-sm text-gray-700">{new Date(lifelistUpdatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <h3 className="text-lg font-medium mb-1 text-gray-700">1. Download from eBird</h3>
            <p className="text-sm text-gray-600 mb-4">Export your life list as a CSV from eBird.</p>
            <Button
              href={EBIRD_LIFELIST_URL}
              target="_blank"
              color="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Icon name="download" /> Download Life List
            </Button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <h3 className="text-lg font-medium mb-1 text-gray-700">
              2. {hasList ? "Re-import" : "Import"} your list
            </h3>
            <p className="text-sm text-gray-600 mb-4">Upload the CSV file you downloaded above.</p>
            <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 mb-6">
            <h3 className="text-lg font-medium mb-1 text-gray-700">Exceptions</h3>
            <p className="text-sm text-gray-600 mb-3">
              Species you want to see again — they stay on your targets even though they&apos;re on your list. Applies to
              all your trips.
            </p>
            {isError && (
              <Alert style="error" className="-mx-1 my-1">
                <Icon name="xMarkCircle" className="text-xl" />
                Failed to load eBird taxonomy
                <button className="text-sky-600 font-medium" onClick={() => refetch()}>
                  Retry
                </button>
              </Alert>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <Icon name="loading" className="animate-spin" />
              </div>
            ) : (
              <AsyncSelect
                value={exceptionsValue}
                loadOptions={taxonomySearch}
                noOptionsMessage={({ inputValue }) =>
                  inputValue.length > 0 ? "No species found" : "Search for a species..."
                }
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                isMulti
                isLoading={isLoading}
                onChange={(newValue: Option[]) => {
                  setExceptionsValue(newValue);
                  setExceptionsMutation.mutate({
                    exceptions: newValue.map((it) => it.value),
                  });
                }}
              />
            )}
          </div>

          <div className="flex">
            <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
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
