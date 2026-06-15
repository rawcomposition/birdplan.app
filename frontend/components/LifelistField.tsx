import React from "react";
import LifelistCard from "components/LifelistCard";
import LifelistUpload from "components/LifelistUpload";
import EbirdDownloadLink from "components/EbirdDownloadLink";

type Props = {
  label?: React.ReactNode;
  cardLabel?: string;
  hasList: boolean;
  count: number;
  onImport: (sciNames: string[], fileName: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  footer?: React.ReactNode;
};

export default function LifelistField({
  label = "Life list",
  cardLabel = "Custom",
  hasList,
  count,
  onImport,
  onRemove,
  disabled,
  footer,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <EbirdDownloadLink className="shrink-0" />
      </div>
      {hasList ? (
        <LifelistCard label={cardLabel} count={count} onImport={onImport} onRemove={onRemove} disabled={disabled} />
      ) : (
        <LifelistUpload onImport={onImport} isPending={disabled} buttonLabel="Choose a CSV file" />
      )}
      {footer && <p className="mt-2 text-xs text-gray-500">{footer}</p>}
    </div>
  );
}
