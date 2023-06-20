import React from "react";
import Header from "components/Header";
import Head from "next/head";
import { useTrip } from "providers/trip";
import Papa from "papaparse";
import toast from "react-hot-toast";
import Button from "components/Button";
import Sidebar from "components/Sidebar";
import { useUI } from "providers/ui";
import { useProfile } from "providers/profile";
import LoginModal from "components/LoginModal";
import Footer from "components/Footer";
import { Target, Option } from "lib/types";
import Select from "components/ReactSelectStyled";
import Download from "icons/Download";
import { useRouter } from "next/router";

const cutoffs = ["5%", "2%", "1%", "0.8%", "0.5%", "0.2%", "0.1%", "0%"];

const getDataInRange = (data: number[], start: number, end: number) => {
  if (start <= end) return data.slice(start - 1, end);
  return [...data.slice(0, end), ...data.slice(start - 1)];
};

export default function ImportTargets() {
  const { trip, setTargets } = useTrip();
  const { lifelist } = useProfile();
  const router = useRouter();
  const { closeSidebar } = useUI();
  const [cutoff, setCutoff] = React.useState<Option>({ value: "1%", label: "1%" });
  const region = trip?.region;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;

  const redirectUrl = lifelist.length > 0 ? `/${trip?.id}` : `/import-lifelist?tripId=${trip?.id}`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        delimiter: "\t",
        complete: async function (results: any) {
          const startWeek = startMonth * 4 - 3;
          const endWeek = endMonth * 4;
          const data = results.data.filter((it: any) => it[""] !== "");
          const species = data.slice(4).map((it: any) => {
            const name = it[""].split(" (")[0];
            const abundance = it.__parsed_extra.slice(0, 48).map((it: string) => Number(it));
            const abundanceInRange = getDataInRange(abundance, startWeek, endWeek);
            const sum = abundanceInRange.reduce((acc, it) => acc + it, 0);
            const percent = (sum / abundanceInRange.length) * 100;
            const rounded =
              percent >= 1
                ? Math.round(percent)
                : percent >= 0.1
                ? Math.round(percent * 10) / 10
                : Math.round(percent * 100) / 100;
            return { name, percent: rounded };
          });

          const sorted = species.sort((a: Target, b: Target) => b.percent - a.percent);

          const filtered = sorted.filter((it: Target) => it.percent >= Number(cutoff.value.replace("%", "")));

          // Fetch to species codes
          const toastId = toast.loading("Importing...");
          const res = await fetch("/api/com-name-codes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(filtered),
          });
          const withCodes = await res.json();
          setTargets(withCodes);
          toast.success("Targets imported");
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
        <title>Bird Planner</title>
      </Head>

      <Header showAccountOnSmScreens />
      <main className="max-w-2xl w-full mx-auto pb-12">
        <Sidebar className="sm:hidden" />
        <div className="p-4 md:p-0 mt-12" onClick={closeSidebar}>
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
                menuPortalTarget={document.body}
              />
            </div>
          </div>
          <div className="pt-4 p-5 bg-white rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4 text-gray-700">3. Upload file</h3>
            <p className="text-sm text-gray-600 mb-2">Uplod the CSV file you downloaded in step 1.</p>
            <input ref={fileInputRef} type="file" accept=".txt" className="text-xs" onChange={handleFileUpload} />
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
