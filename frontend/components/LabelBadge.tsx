import { Label } from "@birdplan/shared";
import { Badge } from "components/ui/badge";
import { labelColorClasses } from "lib/labelColors";
import { cn } from "lib/utils";

type Props = {
  label: Label;
  className?: string;
};

export default function LabelBadge({ label, className }: Props) {
  return (
    <Badge variant="secondary" className={cn(labelColorClasses[label.color].badge, className)}>
      {label.name}
    </Badge>
  );
}
