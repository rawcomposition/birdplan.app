import React from "react";
import toast from "react-hot-toast";
import Icon from "components/Icon";
import { parseLifelistCsv } from "lib/lifelistCsv";

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const sciNames = await parseLifelistCsv(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onImport(sciNames);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-gray-600">{hint}</p>
        <a
          href={ebirdUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-medium text-sky-600 whitespace-nowrap text-sm"
        >
          Download from eBird <Icon name="external" className="text-xs" />
        </a>
      </div>
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
