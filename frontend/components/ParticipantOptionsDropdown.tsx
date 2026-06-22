import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";

export type ParticipantMenuItem = {
  name: string;
  icon: string;
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
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        title="Options"
      >
        <Icon name="verticalDots" className="text-lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[200px]">
        {items.map(({ name, icon, onClick, danger }) => (
          <DropdownMenuItem key={name} onClick={onClick} variant={danger ? "destructive" : "default"}>
            <Icon name={icon as any} />
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
