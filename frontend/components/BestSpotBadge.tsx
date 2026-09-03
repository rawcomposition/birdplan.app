import Icon from "components/Icon";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";

const TOOLTIP = "Your best spot — the highest reporting frequency for this species among your saved hotspots";

export default function BestSpotBadge() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            aria-label="Your best spot for this species"
            className="inline-flex shrink-0 cursor-default items-center justify-center text-pink-700 text-[13px]"
          >
            <Icon name="bullseye" />
          </span>
        }
      />
      <TooltipContent className="max-w-[16rem] text-center">{TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}
