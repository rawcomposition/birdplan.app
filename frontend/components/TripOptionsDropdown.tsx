import React from "react";
import { Link } from "react-router-dom";
import { useModal } from "stores/modals";
import { useProfile } from "hooks/useProfile";
import { useTrip } from "hooks/useTrip";
import useTargetView from "hooks/useTargetView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Icon from "components/Icon";
import { Feather, Users, Settings, Download, Send } from "lucide-react";

type Props = {
  className?: string;
};

export default function TripOptionsDropdown({ className }: Props) {
  const { open } = useModal();
  const { uid } = useProfile();
  const { trip, canEdit, participants } = useTrip();
  const { view } = useTargetView(trip);

  const viewer = trip?.viewer;
  const viewerMode = viewer?.listMode === "custom" ? "Custom" : "World";

  const links = [
    {
      name: `Life List (${viewerMode})`,
      onClick: viewer ? () => open("manageLifelist", { participantId: viewer.participantId }) : undefined,
      href: viewer ? undefined : `/${trip?._id}/participants`,
      icon: <Feather />,
      hidden: !canEdit,
    },
    {
      name: `Participants${participants ? ` (${participants.length})` : ""}`,
      href: `/${trip?._id}/participants`,
      icon: <Users />,
      hidden: !canEdit,
    },
    {
      name: "Trip Settings",
      href: `/${trip?._id}/settings`,
      icon: <Settings />,
      hidden: !canEdit,
    },
    {
      name: "Export KML",
      href: `${import.meta.env.VITE_API_URL}/trips/${trip?._id}/export?uid=${uid}&targets=${view}`,
      icon: <Download />,
    },
    {
      name: "Send to OpenBirding",
      onClick: () => open("openBirding"),
      icon: <Send />,
      hidden: !canEdit,
    },
  ];

  const filteredLinks = links.filter((it) => !it.hidden);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          className ||
          "ml-auto flex shrink-0 items-center justify-center gap-2 rounded px-1 py-1 text-[14px] font-medium text-gray-600 hover:bg-slate-300"
        }
      >
        <Icon name="verticalDots" className="text-lg" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[240px]">
        {filteredLinks.map(({ name, href, onClick, icon }) => {
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
