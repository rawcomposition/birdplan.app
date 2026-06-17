import React from "react";
import clsx from "clsx";
import Icon from "components/Icon";
import { IconNameT } from "lib/icons";

const COLORS = {
  gray: "bg-gray-100 text-gray-500",
  amber: "bg-amber-100 text-amber-700",
};

type Props = {
  color?: keyof typeof COLORS;
  icon?: IconNameT;
  children: React.ReactNode;
};

export default function Badge({ color = "gray", icon, children }: Props) {
  return (
    <span
      className={clsx("ml-2 inline-flex items-center gap-1 rounded-full px-2 text-[11px] font-medium", COLORS[color])}
    >
      {icon && <Icon name={icon} className="text-[10px]" />}
      {children}
    </span>
  );
}
