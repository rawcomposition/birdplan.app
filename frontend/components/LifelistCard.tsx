import React from "react";
import toast from "react-hot-toast";
import { Button } from "components/ui/button";
import Icon from "components/Icon";
import { Spinner } from "components/ui/spinner";
import { parseLifelistCsv } from "lib/lifelistCsv";

type Props = {
  label: string;
  count: number;
  onImport: (sciNames: string[], fileName: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
};

export default function LifelistCard({ label, count, onImport, onRemove, disabled }: Props) {
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    try {
      onImport(await parseLifelistCsv(file), file.name);
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        disabled ? "border-gray-200 bg-gray-50" : "border-green-200 bg-green-50"
      }`}
    >
      <input ref={fileRef} type="file" accept=".csv" className="sr-only" onChange={handlePick} />
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
          disabled ? "bg-gray-400" : "bg-green-600"
        }`}
      >
        {disabled ? <Spinner /> : <Icon name="check" className="text-sm" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 tabular-nums">{count.toLocaleString()} species</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button
          type="button"
          variant="link"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="text-sm"
        >
          Replace
        </Button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Remove"
            className="flex items-center text-gray-400 hover:text-gray-600 disabled:text-gray-300"
          >
            <Icon name="xMark" className="text-base" />
          </button>
        )}
      </div>
    </div>
  );
}
