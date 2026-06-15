import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { Trip } from "@birdplan/shared";
import LifelistUpload from "components/LifelistUpload";
import { useProfile } from "providers/profile";
import useTripLifelist from "hooks/useTripLifelist";
import useLifelistMode from "hooks/useLifelistMode";

type Props = {
  trip: Trip;
  canEdit: boolean;
  mode: ReturnType<typeof useLifelistMode>;
};

// The viewer's own World/Custom chooser, shown inside the Change-life-list modal. Selection is
// staged in the `mode` hook and persisted when the modal's Done button calls mode.save().
export default function LifelistModeChooser({ trip, canEdit, mode }: Props) {
  const { lifelist: globalList } = useProfile();
  const { myCodes } = useTripLifelist(trip);

  const { selectedMode, savedMode, selectWorld, selectCustom, handleCustomImport, listMutation } = mode;

  const hasCustom = savedMode === "custom";
  const customCount = hasCustom ? myCodes.length : 0;
  const customUpdatedAt = hasCustom ? trip?.viewer && trip?.customLifelistUpdatedAt : null;

  return (
    <div role="radiogroup" aria-label="Which list should this trip target against for you?" className="flex flex-col gap-6">
      <OptionRow
        checked={selectedMode === "world"}
        disabled={!canEdit}
        onSelect={selectWorld}
        title="World life list"
        description={`${(globalList?.length || 0).toLocaleString()} species you've recorded worldwide`}
      >
        <Link
          href={`/import-lifelist?returnTo=${encodeURIComponent(`/${trip?._id}/participants`)}`}
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
        {hasCustom && (
          <p className="mb-3 text-[13px] text-gray-500">
            <span className="font-semibold text-gray-700 tabular-nums">{customCount.toLocaleString()} species</span>
            {customUpdatedAt ? ` · updated ${new Date(customUpdatedAt).toLocaleDateString()}` : ""}
          </p>
        )}
        {canEdit ? (
          <LifelistUpload
            variant="compact"
            onImport={handleCustomImport}
            isPending={listMutation.isPending}
            hint={null}
            buttonLabel={hasCustom ? "Choose a new CSV file" : "Choose a CSV file"}
          />
        ) : (
          !hasCustom && <p className="text-sm text-gray-500">No custom list has been uploaded for this trip.</p>
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

// An airy radio row: the whole row toggles; unselected rows dim. The expanded content (manage link
// / upload) sits under the text, indented to align with the title.
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
