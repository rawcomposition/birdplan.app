import React from "react";
import toast from "react-hot-toast";
import Icon from "components/Icon";
import { parseLifelistCsv } from "lib/lifelistCsv";

type Props = {
  onImport: (sciNames: string[], fileName: string) => void;
  isPending?: boolean;
  buttonLabel: string;
  variant?: "dropzone" | "compact";
};

export default function LifelistUpload({ onImport, isPending, buttonLabel, variant = "dropzone" }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    try {
      onImport(await parseLifelistCsv(file), file.name);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
    }
  };

  if (variant === "compact") {
    return (
      <label
        className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors ${
          isPending ? "bg-gray-100 text-gray-400" : "cursor-pointer bg-primary/10 text-link hover:bg-primary/15"
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
        <Icon name={isPending ? "loading" : "feather"} className={isPending ? "animate-spin" : ""} />
        {isPending ? "Importing…" : buttonLabel}
      </label>
    );
  }

  return (
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
  );
}
