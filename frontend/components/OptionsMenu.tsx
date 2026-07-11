import React from "react";
import { Link } from "react-router-dom";
import { cn } from "lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "components/ui/dropdown-menu";

export type OptionItem = {
  name: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
};

type Props = {
  items: OptionItem[];
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
};

const isExternal = (href: string) => /^(https?:|mailto:|tel:|om:)/.test(href);

export default function OptionsMenu({ items, children, align = "end", className }: Props) {
  const visible = items.filter((it) => !it.hidden);
  if (!visible.length) return null;

  return (
    <DropdownMenu>
      {children}
      <DropdownMenuContent align={align} className={cn("w-auto", className)}>
        {visible.map(({ name, icon, onClick, href, danger, disabled }) => {
          const render = onClick || !href ? undefined : isExternal(href) ? <a href={href} /> : <Link to={href} />;
          return (
            <DropdownMenuItem
              key={name}
              onClick={onClick}
              disabled={disabled}
              variant={danger ? "destructive" : "default"}
              render={render}
            >
              {icon}
              <span>{name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
