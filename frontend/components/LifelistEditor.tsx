import React from "react";
import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Trip } from "@birdplan/shared";
import LifelistField from "components/LifelistField";
import { useUser } from "hooks/useUser";
import { useModal } from "stores/modals";
import useTripLifelist from "hooks/useTripLifelist";
import useLifelistMode from "hooks/useLifelistMode";
import { withReturnTo } from "lib/helpers";

type Props = {
  trip: Trip;
  mode: ReturnType<typeof useLifelistMode>;
  embedded?: boolean;
};

export default function LifelistEditor({ trip, mode, embedded }: Props) {
  const { lifelist: worldList } = useUser();
  const { myLifelist } = useTripLifelist(trip);
  const location = useLocation();
  const asPath = `${location.pathname}${location.search}`;
  const { close } = useModal();

  const { selectedMode, savedMode, selectWorld, selectCustom, handleCustomImport, listMutation } = mode;

  const hasCustom = savedMode === "custom";
  const customCount = hasCustom ? myLifelist.length : 0;

  return (
    <>
      {!embedded && (
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          Choose which life list to use for determining your trip targets.
        </p>
      )}
      <div
        role="radiogroup"
        aria-label="Which list should this trip target against for you?"
        className="flex flex-col gap-6"
      >
        <OptionRow
          checked={selectedMode === "world"}
          onSelect={selectWorld}
          title="World life list"
          description={`${(worldList?.length || 0).toLocaleString()} species`}
        >
          <Link
            to={withReturnTo("/import-lifelist", asPath)}
            onClick={close}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-link"
          >
            Manage your World life list →
          </Link>
        </OptionRow>

        <OptionRow
          checked={selectedMode === "custom"}
          onSelect={selectCustom}
          title="Custom"
          description="Applies only to this trip — your World life list stays untouched."
        >
          <LifelistField
            hasList={hasCustom}
            count={customCount}
            onImport={handleCustomImport}
            disabled={listMutation.isPending}
          />
        </OptionRow>
      </div>
    </>
  );
}

type OptionRowProps = {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
};

function OptionRow({ checked, onSelect, title, description, children }: OptionRowProps) {
  return (
    <div
      role="button"
      onClick={onSelect}
      className={clsx("cursor-pointer transition-opacity", checked ? "opacity-100" : "opacity-50")}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={clsx(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            checked ? "border-primary" : "border-gray-300"
          )}
        >
          {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
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
