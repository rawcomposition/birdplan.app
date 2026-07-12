import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
import LifelistUploadError from "components/LifelistUploadError";
import { useLifelistUpload } from "hooks/useLifelistUpload";

type Props = {
  onImport: (sciNames: string[], fileName: string) => void;
  isPending?: boolean;
  buttonLabel?: string;
  variant?: "dropzone" | "compact";
  world?: boolean;
};

export default function LifelistUpload({ onImport, isPending, buttonLabel, variant = "dropzone", world }: Props) {
  const { error, handleFileUpload } = useLifelistUpload(onImport);

  if (variant === "compact") {
    return (
      <div className="flex flex-col gap-2">
        <label
          className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold transition-colors ${
            isPending ? "bg-gray-100 text-gray-400" : "cursor-pointer bg-primary/10 text-link hover:bg-primary/15"
          }`}
        >
          <input
            type="file"
            accept=".csv"
            disabled={isPending}
            className="sr-only"
            onChange={handleFileUpload}
          />
          {isPending ? <Spinner /> : <Icon name="feather" />}
          {isPending ? "Importing…" : buttonLabel}
        </label>
        {error && <LifelistUploadError kind={error} world={world} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isPending
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40"
        }`}
      >
        <input type="file" accept=".csv" disabled={isPending} className="sr-only" onChange={handleFileUpload} />
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          {isPending ? <Spinner className="size-4.5" /> : <Icon name="feather" className="text-lg" />}
        </span>
        {isPending ? (
          <span className="text-sm font-medium text-gray-600">Importing…</span>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-700">Drop or choose file</span>
            <span className="text-xs text-gray-400">CSV files only</span>
          </>
        )}
      </label>
      {error && <LifelistUploadError kind={error} />}
    </div>
  );
}
