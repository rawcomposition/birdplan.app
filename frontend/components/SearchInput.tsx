import React from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type">;

export default function SearchInput({ className, ...props }: Props) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground shadow-xs outline-primary outline-offset-0 placeholder:text-muted-foreground focus:border-ring"
        {...props}
      />
    </div>
  );
}
