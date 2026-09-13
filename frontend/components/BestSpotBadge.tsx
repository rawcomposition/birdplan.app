import { Crosshair } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";

const TOOLTIP = "This hotspot has a higher reporting frequency for this species than your other saved hotspots during the selected period.";

export default function BestSpotBadge() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            aria-label="Your best spot for this species"
            className="inline-flex shrink-0 cursor-default items-center justify-center text-pink-700"
          >
            <Crosshair className="size-4" />
          </span>
        }
      />
      <TooltipContent className="max-w-[16rem] text-center">{TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}
