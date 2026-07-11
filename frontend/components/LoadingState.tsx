import { Spinner } from "components/ui/spinner";
import { cn } from "lib/utils";

type Props = {
  label?: string;
  inline?: boolean;
  className?: string;
  spinnerClassName?: string;
};

export default function LoadingState({ label, inline, className, spinnerClassName }: Props) {
  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          label ? "py-6" : "justify-center py-8",
          className
        )}
      >
        <Spinner className={cn(label ? "" : "size-6", spinnerClassName)} />
        {label && <span>{label}</span>}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center py-20", className)}>
      <Spinner className={cn("size-9", spinnerClassName)} />
    </div>
  );
}
