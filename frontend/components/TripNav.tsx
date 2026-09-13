import React from "react";
import { cn } from "lib/utils";
import { useTrip } from "hooks/useTrip";
import { useUser } from "hooks/useUser";
import useTargetView from "hooks/useTargetView";
import { Link, useLocation } from "react-router-dom";
import { useModal } from "stores/modals";
import OptionsMenu from "components/OptionsMenu";
import { DropdownMenuTrigger } from "components/ui/dropdown-menu";
import { Button, buttonVariants } from "components/ui/button";
import Icon from "components/Icon";
import { Feather, Users, Settings, Download, Send } from "lucide-react";

const links = [
  { name: "Map", slug: "", icon: "mapFlat" },
  { name: "Targets", slug: "targets", icon: "bullseye" },
  { name: "Itinerary", slug: "itinerary", icon: "calendar" },
];

export default function TripNav() {
  const { trip, canEdit, participants } = useTrip();
  const { user } = useUser();
  const { view } = useTargetView(trip);
  const { pathname } = useLocation();
  const { open, close } = useModal();
  const active = pathname.split("/")[2] ?? "";

  React.useEffect(() => {
    close();
  }, [pathname]);

  const viewer = trip?.viewer;
  const viewerMode = viewer?.listMode === "custom" ? "Custom" : "World";

  const manageOptions = [
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
    <div
      className={cn("bg-card px-2 pb-2 pt-0.5 h-[55px] print:hidden", active !== "" && "border-b border-border/60")}
    >
      <div className="flex gap-1.5 items-center shrink-0 bg-muted justify-start rounded-full px-2.5 py-2">
        {links.map(({ name, slug, icon }) => (
          <Link
            to={`/${trip?._id}${slug ? `/${slug}` : ""}`}
            key={slug}
            className={cn(
              buttonVariants({ variant: "nav", size: "none" }),
              "py-1 px-2.5 text-[14px]",
              active === slug && "bg-primary text-primary-foreground hover:bg-primary"
            )}
          >
            <Icon name={icon as any} className="hidden! xs:inline!" />
            {name}
          </Link>
        ))}
        {canEdit && (
          <OptionsMenu items={manageOptions} className="min-w-[240px]">
            <DropdownMenuTrigger
              render={<Button variant="nav" className="ml-auto gap-1 py-1 px-2 sm:px-2.5 text-[14px]" />}
            >
              <Icon name="verticalDots" className="sm:hidden" />
              <Settings className="hidden sm:inline size-4" />
              <span className="hidden sm:inline">Manage</span>
            </DropdownMenuTrigger>
          </OptionsMenu>
        )}
      </div>
    </div>
  );
}
