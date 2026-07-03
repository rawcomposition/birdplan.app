import { cn } from "lib/utils";
import Icon from "components/Icon";
import { Tooltip, TooltipTrigger, TooltipContent } from "components/ui/tooltip";

const TOOLTIP = "Mutual target — everyone in your group still needs this species";

type Props = {
  size?: "sm" | "md";
  variant?: "badge" | "icon";
};

export default function MutualBadge({ size = "sm", variant = "badge" }: Props) {
  const iconOnly = variant === "icon";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            aria-label="Mutual target"
            className={cn(
              "inline-flex shrink-0 cursor-default items-center justify-center",
              iconOnly
                ? cn("text-emerald-600", size === "md" ? "text-[15px]" : "text-[13px]")
                : cn(
                    "rounded-full bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-700/20",
                    size === "md" ? "h-6 w-6 text-[12px]" : "h-5 w-5 text-[11px]"
                  )
            )}
          >
            <Icon name="userFriends" />
          </span>
        }
      />
      <TooltipContent className="max-w-[16rem] text-center">{TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}
