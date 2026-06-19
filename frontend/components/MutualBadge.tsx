import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";
import Tooltip from "components/Tooltip";

const TOOLTIP = "Mutual target — everyone in your group still needs this species";

type Props = {
  size?: "sm" | "md";
};

export default function MutualBadge({ size = "sm" }: Props) {
  return (
    <Tooltip content={TOOLTIP} className="inline-flex flex-shrink-0">
      <span
        aria-label="Mutual target"
        className={clsx(
          "inline-flex cursor-default items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20",
          size === "md" ? "h-6 w-6 text-[12px]" : "h-5 w-5 text-[11px]"
        )}
      >
        <Icon name="userFriends" />
      </span>
    </Tooltip>
  );
}
