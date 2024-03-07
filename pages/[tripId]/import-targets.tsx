import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import toast from "react-hot-toast";
import Button from "components/Button";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import { Option } from "lib/types";
import Select from "components/ReactSelectStyled";
import Download from "icons/Download";
import { useRouter } from "next/router";
import { parseTargets } from "lib/helpers";
import Link from "next/link";

const cutoffs = ["5%", "2%", "1%", "0.8%", "0.5%", "0.2%", "0.1%", "0%"];

export default function ImportTargets() {
  const { trip, setTargets } = useTrip();
  const { lifelist } = useProfile();
  const router = useRouter();
  const redirect = router.query.redirect || "";
  const showBack = router.query.back === "true";
  const [cutoff, setCutoff] = React.useState<Option>({ value: "1%", label: "1%" });
  const region = trip?.region;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;
  const redirectUrl =
    lifelist.length > 0
      ? `/${trip?.id}/${redirect}`
      : `/import-lifelist?tripId=${trip?.id}&back=${showBack ? "true" : "false"}`;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!trip) return;
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const toastId = toast.loading("Importing...");
      const res = await parseTargets({ file, cutoff: cutoff.value, startMonth, endMonth });
      setTargets({ ...res, tripId: trip.id });
      toast.success("Targets imported");
      toast.dismiss(toastId);
      router.push(redirectUrl);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Head>
        <title>Import Targets | BirdPlan.app</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        {showBack && (
          <Link href={`/${trip?.id}`} className="text-gray-500 hover:text-gray-600 mt-6 inline-flex items-center">
            ← Back to trip
          </Link>
        )}
        <div className="p-4 md:p-0 mt-8">
          <h1 className="text-3xl font-bold text-gray-700 mb-8">🎯 Import Targets</h1>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">1. Download targets from eBird</h3>
            <Button
              href={`https://ebird.org/barchartData?r=${region}&bmo=${startMonth}&emo=${endMonth}&byr=1900&eyr=2023&fmt=tsv`}
              target="_blank"
              color="primary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <Download /> Download Targets
            </Button>
            <p className="bg-amber-100 text-amber-800 p-2 rounded text-[12px] mt-4">
              <strong>Note:</strong> Your{" "}
              <a href="https://ebird.org/prefs" className="text-sky-600" target="_blank" rel="noreferrer">
                eBird Preferences
              </a>{" "}
              must be set to show species names in <strong>English</strong> or <strong>English (US)</strong> for this to
              work.
            </p>
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">2. Choose a cutoff</h3>
            <label htmlFor="cutoff" className="text-sm text-gray-600 mb-2 block">
              Ignore targets below
            </label>
            <div className="max-w-xs">
              <Select
                id="cutoff"
                options={cutoffs.map((it) => ({ value: it, label: it }))}
                value={cutoff}
                onChange={setCutoff}
                menuPortalTarget={typeof document !== "undefined" && document.body}
              />
            </div>
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">3. Upload file</h3>
            <p className="text-sm text-gray-600 mb-2">Upload the TXT file you downloaded in step 1.</p>
            <input ref={fileInputRef} type="file" accept=".txt,.xls" className="text-xs" onChange={handleFileUpload} />
          </div>
          <div className="flex">
            <Button href={redirectUrl} color="gray" className="inline-flex items-center ml-auto">
              Skip
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <LoginModal showLoader={false} />
    </div>
  );
}
