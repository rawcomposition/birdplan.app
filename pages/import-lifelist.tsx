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
import { useQueryClient } from "@tanstack/react-query";

export default function ImportLifelist() {
  const { exceptions } = useProfile();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const setExceptionsMutation = useMutation({
    url: "/api/v1/my-profile",
    method: "PATCH",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/my-profile`] });
    },
  });

  const setLifelistMutation = useMutation({
    url: "/api/v1/my-profile",
    method: "PATCH",
    onMutate: () => {
      toast.loading("Importing life list...", { id: "import-lifelist" });
    },
    onSettled: () => {
      toast.dismiss("import-lifelist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/v1/my-profile`] });
      router.push(redirectUrl);
    },
  });

  const router = useRouter();
  const { tripId } = router.query;
  const showBack = router.query.back === "true" && tripId;
  const redirectUrl = tripId ? `/${tripId}` : `/`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: async function (results: any) {
          // Extract the scientific names
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]);
          fileInputRef.current?.value && (fileInputRef.current.value = "");
          setLifelistMutation.mutate({ lifelist: sciNames });
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
        <title>Import Life List | BirdPlan.app</title>
      </Head>

      <Header />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {showBack && (
          <Link
            href={`/${tripId}`}
            className="text-gray-500 hover:text-gray-600 mt-6 ml-4 md:ml-0 inline-flex items-center"
          >
            ← Back to trip
          </Link>
        )}
        <div className="px-4 md:px-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Icon name="feather" className="text-2xl text-lime-600" /> {"Import Life List"}
          </h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">1. Download life list from eBird</h3>
            <Button
              href={`https://ebird.org/lifelist?r=world&time=life&fmt=csv`}
              target="_blank"
              color="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Icon name="download" /> Download Life List
            </Button>
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">2. Enter Exceptions (optional)</h3>
            <p className="text-sm text-gray-600 mb-2">Enter comma separated list of eBird species codes to ignore.</p>
            <input
              type="text"
              className="input text-xs"
              onBlur={(e) =>
                setExceptionsMutation.mutate({
                  exceptions: e.target.value?.split(",").map((it) => it.trim().toLowerCase()) || [],
                })
              }
              defaultValue={exceptions?.join(", ")}
            />
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">3. Upload file</h3>
            <p className="text-sm text-gray-600 mb-2">Upload the CSV file you downloaded in step 1.</p>
            <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
          </div>
          <div className="flex">
            <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
              {tripId ? "Skip" : "Cancel"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
