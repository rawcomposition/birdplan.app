import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { Trip } from "@birdplan/shared";
import LifelistField from "components/LifelistField";
import { useProfile } from "providers/profile";
import { useModal } from "providers/modals";
import useTripLifelist from "hooks/useTripLifelist";
import useLifelistMode from "hooks/useLifelistMode";
import { withReturnTo } from "lib/helpers";

type Props = {
  trip: Trip;
  canEdit: boolean;
  mode: ReturnType<typeof useLifelistMode>;
};

export default function LifelistModeChooser({ trip, canEdit, mode }: Props) {
  const { lifelist: worldList } = useProfile();
  const { myLifelist } = useTripLifelist(trip);
  const { asPath } = useRouter();
  const { close } = useModal();

  const { selectedMode, savedMode, selectWorld, selectCustom, handleCustomImport, listMutation } = mode;

  const hasCustom = savedMode === "custom";
  const customCount = hasCustom ? myLifelist.length : 0;
  const customUpdatedAt = hasCustom ? trip?.viewer && trip?.groupLifelistUpdatedAt : null;

  return (
    <div
      role="radiogroup"
      aria-label="Which list should this trip target against for you?"
      className="flex flex-col gap-6"
    >
      <OptionRow
        checked={selectedMode === "world"}
        disabled={!canEdit}
        onSelect={selectWorld}
        title="World life list"
        description={`${(worldList?.length || 0).toLocaleString()} species`}
      >
        <Link
          href={withReturnTo("/import-lifelist", asPath)}
          onClick={close}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600"
        >
          Manage your World life list →
        </Link>
      </OptionRow>

      <OptionRow
        checked={selectedMode === "custom"}
        disabled={!canEdit}
        onSelect={selectCustom}
        title="Custom"
        description="Applies only to this trip — your World life list stays untouched."
      >
        {canEdit ? (
          <LifelistField
            hasList={hasCustom}
            count={customCount}
            onImport={handleCustomImport}
            disabled={listMutation.isPending}
          />
        ) : hasCustom ? (
          <p className="text-[13px] text-gray-500">
            <span className="font-semibold text-gray-700 tabular-nums">{customCount.toLocaleString()} species</span>
            {customUpdatedAt ? ` · updated ${new Date(customUpdatedAt).toLocaleDateString()}` : ""}
          </p>
        ) : (
          <p className="text-sm text-gray-500">No custom list has been uploaded for this trip.</p>
        )}
      </OptionRow>
    </div>
  );
}

type OptionRowProps = {
  checked: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
};

function OptionRow({ checked, disabled, onSelect, title, description, children }: OptionRowProps) {
  return (
    <div
      role="button"
      onClick={disabled ? undefined : onSelect}
      className={clsx("transition-opacity", !disabled && "cursor-pointer", checked ? "opacity-100" : "opacity-50")}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={clsx(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            checked ? "border-blue-500" : "border-gray-300"
          )}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-blue-500" />}
        </span>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-gray-900">{title}</div>
          <div className="mt-0.5 text-[13px] leading-snug text-gray-500">{description}</div>
          {checked && children && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
