import React from "react";
import { Header, Body } from "providers/modals";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useModal } from "providers/modals";
import { useTrip } from "providers/trip";
import { Target, Option } from "lib/types";
import Select from "components/ReactSelectStyled";

const cutoffs = ["5%", "2%", "1%", "0.8%", "0.5%", "0.2%", "0.1%"];

export default function UploadTargets() {
  const [cutoff, setCutoff] = React.useState<Option>({ value: "1%", label: "1%" });
  const { trip, setTargets } = useTrip();
  const region = trip?.region;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { close } = useModal();
  const startMonth = trip?.startMonth || 1;
  const endMonth = trip?.endMonth || 12;

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
          close();
          toast.dismiss(toastId);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  return (
    <>
      <Header>Import Targets</Header>
      <Body>
        <p className="text-sm mb-2">
          <a
            href={`https://ebird.org/barchartData?r=${region}&bmo=${startMonth}&emo=${endMonth}&byr=1900&eyr=2023&fmt=tsv`}
            className="text-sky-600"
            target="_blank"
            rel="noreferrer"
          >
            Click here
          </a>{" "}
          to download your regional targets as a CSV file. Upload the file below.
        </p>
        <p className="bg-amber-100 text-amber-800 p-2 rounded text-[12px] mb-4 mt-4">
          <strong>Note:</strong> Your{" "}
          <a href="https://ebird.org/prefs" className="text-sky-600" target="_blank" rel="noreferrer">
            eBird Preferences
          </a>{" "}
          must be set to show species names in <strong>English</strong> or <strong>English (US)</strong> for this to
          work.
        </p>
        <div className="my-4 flex flex-col gap-1">
          <label htmlFor="cutoff" className="text-sm">
            Ignore targets below
          </label>
          <Select
            id="cutoff"
            options={cutoffs.map((it) => ({ value: it, label: it }))}
            value={cutoff}
            onChange={setCutoff}
            menuPortalTarget={document.body}
          />
        </div>
        <input ref={fileInputRef} type="file" accept=".txt" className="text-xs" onChange={handleFileUpload} />
      </Body>
    </>
  );
}

const getDataInRange = (data: number[], start: number, end: number) => {
  if (start <= end) return data.slice(start - 1, end);
  return [...data.slice(0, end), ...data.slice(start - 1)];
};
