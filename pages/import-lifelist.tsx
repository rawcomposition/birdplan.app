import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useProfile } from "providers/profile";
import { useRouter } from "next/router";
import Header from "components/Header";
import Head from "next/head";
import Sidebar from "components/Sidebar";
import Button from "components/Button";
import Footer from "components/Footer";
import Download from "icons/Download";
import { useUI } from "providers/ui";
import LoginModal from "components/LoginModal";
import Feather from "icons/Feather";
import Link from "next/link";

export default function ImportLifelist() {
  const { setLifelist, setExceptions, exceptions, setCountryLifelist } = useProfile();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { closeSidebar } = useUI();

  const router = useRouter();
  const { tripId, isCountry } = router.query;
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

          // Convert to species codes
          const toastId = toast.loading("Importing...");
          const res = await fetch("/api/lifelist-codes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sciNames),
          });
          const codes = await res.json();
          if (Array.isArray(codes)) {
            isCountry ? setCountryLifelist(codes) : setLifelist(codes);
            toast.success("Life list uploaded");
          } else {
            toast.error("Error uploading life list");
          }
          toast.dismiss(toastId);
          router.push(redirectUrl);
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

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        {tripId && (
          <Link href={`/${tripId}`} className="text-gray-500 hover:text-gray-600 mb-8 inline-flex items-center">
            ← Back to trip
          </Link>
        )}
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
          <h1 className="text-3xl font-bold text-gray-700 mb-8">
            <Feather className="text-2xl text-lime-600" /> {isCountry ? "Import US Life List" : "Import Life List"}
          </h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">1. Download life list from eBird</h3>
            <Button
              href={`https://ebird.org/lifelist?r=${isCountry ? "US" : "world"}&time=life&fmt=csv`}
              target="_blank"
              color="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Download /> Download Life List
            </Button>
          </div>
          {!isCountry && (
            <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-700">2. Enter Exceptions (optional)</h3>
              <p className="text-sm text-gray-600 mb-2">Enter comma separated list of eBird species codes to ignore.</p>
              <input
                type="text"
                className="input text-xs"
                onBlur={(e) => setExceptions(e.target.value)}
                defaultValue={exceptions?.join(", ")}
              />
            </div>
          )}
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">{isCountry ? "2." : "3."} Upload file</h3>
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
