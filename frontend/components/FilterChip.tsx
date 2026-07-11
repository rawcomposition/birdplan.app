import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "lib/utils";

const filterChipVariants = cva(
  "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium shadow-xs",
  {
    variants: {
      tone: {
        primary: "",
        amber: "",
        emerald: "",
      },
      active: {
        true: "",
        false: "border-border bg-card text-secondary-foreground hover:bg-muted/50",
      },
    },
    compoundVariants: [
      { tone: "primary", active: true, class: "border-primary/30 bg-primary/10 text-primary-hover" },
      { tone: "amber", active: true, class: "border-yellow-300 bg-yellow-50 text-yellow-800" },
      { tone: "emerald", active: true, class: "border-emerald-300 bg-emerald-50 text-emerald-800" },
    ],
    defaultVariants: { tone: "primary", active: false },
  }
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof filterChipVariants>;

export default function FilterChip({ className, tone, active, ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      className={cn(filterChipVariants({ tone, active }), className)}
      {...props}
    />
  );
}
