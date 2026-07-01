import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import { Button } from "components/ui/button";

export type ParticipantMenuItem = {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  items: ParticipantMenuItem[];
};

export default function ParticipantOptionsDropdown({ items }: Props) {
  if (!items.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" />}
        title="Options"
      >
        <Icon name="verticalDots" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[200px]">
        {items.map(({ name, icon, onClick, danger }) => (
          <DropdownMenuItem key={name} onClick={onClick} variant={danger ? "destructive" : "default"}>
            {icon}
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
