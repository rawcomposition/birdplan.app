import { TripLabel } from "@birdplan/shared";
import { Badge } from "components/ui/badge";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";

type Props = {
  label: TripLabel;
  className?: string;
};

export default function LabelBadge({ label, className }: Props) {
  return (
    <Badge variant="secondary" className={cn("h-6 px-2 text-[13px]", labelColorClasses[label.color].badge, className)}>
      {label.name}
    </Badge>
  );
}
