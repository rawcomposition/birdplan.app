import React from "react";
import { Link } from "react-router-dom";
import { useModal } from "stores/modals";
import { useUser } from "hooks/useUser";
import { useTrip } from "hooks/useTrip";
import useTargetView from "hooks/useTargetView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import { Button } from "components/ui/button";
import { cn } from "lib/utils";
import { Feather, Users, Settings, Download, Send } from "lucide-react";

type Props = {
  className?: string;
};

export default function TripOptionsDropdown({ className }: Props) {
  const { open } = useModal();
  const { user } = useUser();
  const { trip, canEdit, participants } = useTrip();
  const { view } = useTargetView(trip);

  const viewer = trip?.viewer;
  const viewerMode = viewer?.listMode === "custom" ? "Custom" : "World";

  if (!canEdit) return null;

  const links = [
    {
      name: `Life List (${viewerMode})`,
      onClick: viewer ? () => open("manageLifelist", { participantId: viewer.participantId }) : undefined,
      href: viewer ? undefined : `/${trip?._id}/participants`,
      icon: <Feather />,
    },
    {
      name: `Participants${participants ? ` (${participants.length})` : ""}`,
      href: `/${trip?._id}/participants`,
      icon: <Users />,
    },
    {
      name: "Trip Settings",
      href: `/${trip?._id}/settings`,
      icon: <Settings />,
    },
    {
      name: "Export KML",
      href: `${import.meta.env.VITE_API_URL}/trips/${trip?._id}/export?userId=${user?._id}&targets=${view}`,
      icon: <Download />,
    },
    {
      name: "Send to OpenBirding",
      onClick: () => open("openBirding"),
      icon: <Send />,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="nav" className={cn("ml-auto gap-1 py-1 px-2 sm:px-2.5 text-[14px]", className)} />}
      >
        <Icon name="verticalDots" className="sm:hidden" />
        <Settings className="hidden sm:inline size-4" />
        <span className="hidden sm:inline">Manage</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[240px]">
        {links.map(({ name, href, onClick, icon }) => {
          const render = onClick ? undefined : /^(https?:|mailto:|tel:|om:)/.test(href ?? "") ? (
            <a href={href ?? "#"} />
          ) : (
            <Link to={href ?? "#"} />
          );
          return (
            <DropdownMenuItem key={name} onClick={onClick} render={render}>
              {icon}
              <span>{name}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
