import React from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import Icon from "components/Icon";

const DEFAULT_EBIRD_URL = "https://ebird.org/lifelist";

type Props = {
  onImport: (sciNames: string[]) => void;
  isPending?: boolean;
  hint: React.ReactNode;
  buttonLabel: string;
  ebirdUrl?: string;
};

export default function LifelistUpload({ onImport, isPending, hint, buttonLabel, ebirdUrl = DEFAULT_EBIRD_URL }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: (results: any) => {
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]);
          if (fileInputRef.current) fileInputRef.current.value = "";
          onImport(sciNames);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">
        {hint}{" "}
        <a href={ebirdUrl} target="_blank" rel="noreferrer" className="font-medium text-sky-600 whitespace-nowrap">
          Get your CSV from eBird <Icon name="external" className="text-xs" />
        </a>
      </p>
      <label
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isPending
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          disabled={isPending}
          className="sr-only"
          onChange={handleFileUpload}
        />
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Icon name={isPending ? "loading" : "feather"} className={`text-lg ${isPending ? "animate-spin" : ""}`} />
        </span>
        {isPending ? (
          <span className="text-sm font-medium text-gray-600">Importing…</span>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-700">{buttonLabel}</span>
            <span className="text-xs text-gray-400">eBird .csv export</span>
          </>
        )}
      </label>
    </div>
  );
}
