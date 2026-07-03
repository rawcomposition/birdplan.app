import React from "react";
import { cn } from "lib/utils";

type Option<T> = { value: T; label: string; icon?: React.ReactNode };

type Props<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export default function SegmentedControl<T extends string | number | null>({
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  return (
    <div className={cn("inline-flex h-9 items-center rounded-lg border border-border bg-muted p-0.5", className)}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-full items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium",
            value === option.value ? "bg-card text-foreground shadow-xs" : "text-secondary-foreground hover:text-foreground"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
