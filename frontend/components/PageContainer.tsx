import React from "react";
import { cn } from "lib/utils";

const maxWidths = {
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

export type PageWidth = keyof typeof maxWidths;

type Props = {
  width?: PageWidth;
  className?: string;
  children: React.ReactNode;
};

export default function PageContainer({ width = "2xl", className, children }: Props) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 pb-16 sm:px-6 sm:py-8", maxWidths[width], className)}>{children}</div>
  );
}
