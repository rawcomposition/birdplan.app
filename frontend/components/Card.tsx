import React from "react";
import { cn } from "lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: CardProps) {
  return <div className={cn("rounded-xl border border-gray-200 bg-white shadow-xs", className)} {...props} />;
}
