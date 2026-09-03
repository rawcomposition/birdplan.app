import React from "react";
import Icon from "components/Icon";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";
import { formatFrequency } from "lib/helpers";
import { cn } from "lib/utils";
import type { KeyTargetGroup } from "hooks/useKeyTargets";

const TOOLTIP =
  "Species more likely at this day's hotspots than anywhere else on your itinerary, based on eBird reports for this month.";

type Props = {
  groups: KeyTargetGroup[];
};

export default function KeyTargets({ groups }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  if (!groups.length) return null;

  const speciesCount = new Set(groups.flatMap((it) => it.targets.map((target) => target.code))).size;

  return (
    <div className="mt-4 rounded-lg border border-border/70 bg-muted/40 px-3 py-2.5 print:break-inside-avoid">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
        >
          <Icon
            name="angleDown"
            className={cn("text-[9px] transition-transform print:hidden", !expanded && "-rotate-90")}
          />
          Key species to look for
          <span className="font-normal text-muted-foreground/70 print:hidden">({speciesCount})</span>
        </button>
        <Tooltip>
          <TooltipTrigger
            render={
              <span
                aria-label="What this means"
                className="cursor-default text-[11px] text-muted-foreground/70 print:hidden"
              >
                <Icon name="questionMark" />
              </span>
            }
          />
          <TooltipContent className="max-w-[18rem] text-center">{TOOLTIP}</TooltipContent>
        </Tooltip>
      </div>
      <div className={cn("mt-2 flex flex-col gap-2.5", !expanded && "hidden print:flex")}>
        {groups.map((group) => (
          <div key={group.hotspotId}>
            <div className="text-[12px] font-semibold text-foreground">{group.hotspotName}</div>
            <ul className="mt-0.5 flex flex-col gap-0.5">
              {group.targets.map((it) => (
                <li key={it.code} className="flex items-baseline gap-2 text-[13px]">
                  <span className="truncate text-secondary-foreground">{it.name}</span>
                  <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
                    {formatFrequency(it.frequency)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
