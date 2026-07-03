import React from "react";
import Icon from "components/Icon";
import { IconNameT } from "lib/icons";
import { cn } from "lib/utils";

type Props = {
  title: string;
  hat?: string;
  subtitle?: React.ReactNode;
  icon?: IconNameT;
  iconClassName?: string;
  className?: string;
};

export default function Heading({ title, hat, subtitle, icon, iconClassName, className }: Props) {
  return (
    <div className={className}>
      {hat && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{hat}</p>}
      <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-foreground">
        {icon && <Icon name={icon} className={cn("text-xl text-muted-foreground", iconClassName)} />}
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
