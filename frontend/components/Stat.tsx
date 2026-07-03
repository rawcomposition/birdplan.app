import { Link } from "react-router-dom";
import { Card } from "components/ui/card";
import { Skeleton } from "components/ui/skeleton";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number | null;
  icon: LucideIcon;
  href: string;
};

export default function Stat({ label, value, icon: Icon, href }: Props) {
  return (
    <Link to={href}>
      <Card className="p-4 h-full transition-colors hover:border-primary/40">
        <Icon className="size-4 text-muted-foreground" />
        {value === null ? (
          <Skeleton className="mt-1 h-7 w-10" />
        ) : (
          <div className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</div>
        )}
        <div className="text-xs text-muted-foreground">{label}</div>
      </Card>
    </Link>
  );
}
