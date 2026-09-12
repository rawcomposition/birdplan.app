import { TripLabel } from "@birdplan/shared";
import { Badge } from "components/ui/badge";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";

type Props = {
  label: TripLabel;
  className?: string;
  children?: React.ReactNode;
};

export default function LabelBadge({ label, className, children }: Props) {
  return (
    <Badge variant="secondary" className={cn("h-6 px-2 text-[13px]", labelColorClasses[label.color].badge, className)}>
      {children}
      {label.name}
    </Badge>
  );
}
