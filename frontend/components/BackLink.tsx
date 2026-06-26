import React from "react";
import { Link } from "react-router-dom";
import Icon from "components/Icon";
import { cn } from "lib/utils";

type Props = {
  to: string;
  label: string;
  className?: string;
};

export default function BackLink({ to, label, className }: Props) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-700",
        className
      )}
    >
      <Icon name="arrowLeft" className="text-xs" />
      {label}
    </Link>
  );
}
