import React from "react";
import toast from "react-hot-toast";
import { parseLifelistCsv, LifelistCsvError, LifelistCsvErrorKind } from "lib/lifelistCsv";

type OnImport = (sciNames: string[], fileName: string) => void;

export function useLifelistUpload(onImport: OnImport) {
  const [error, setError] = React.useState<LifelistCsvErrorKind | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      onImport(await parseLifelistCsv(file), file.name);
    } catch (err) {
      console.error(err);
      if (err instanceof LifelistCsvError) {
        setError(err.kind);
      } else {
        toast.error("Error processing file");
      }
    }
  };

  return { error, handleFileUpload };
}
