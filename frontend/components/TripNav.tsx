import React from "react";
import { cn } from "lib/utils";
import { useTrip } from "hooks/useTrip";
import { Link, useLocation } from "react-router-dom";
import { useModal } from "stores/modals";
import TripOptionsDropdown from "components/TripOptionsDropdown";
import { buttonVariants } from "components/ui/button";
import Icon from "components/Icon";

const links = [
  { name: "Map", slug: "", icon: "mapFlat" },
  { name: "Targets", slug: "targets", icon: "bullseye" },
  { name: "Itinerary", slug: "itinerary", icon: "calendar" },
];

export default function TripNav() {
  const { trip } = useTrip();
  const { pathname } = useLocation();
  const { close } = useModal();
  const active = pathname.split("/")[2] ?? "";

  React.useEffect(() => {
    close();
  }, [pathname]);

  return (
    <div className={cn("bg-white px-2 pb-2 pt-0.5 h-[55px] print:hidden", active !== "" && "border-b border-gray-100")}>
      <div className="flex gap-1.5 items-center shrink-0 bg-slate-200/80 justify-start rounded-full px-2.5 py-2">
        {links.map(({ name, slug, icon }) => (
          <Link
            to={`/${trip?._id}/${slug}`}
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
        <TripOptionsDropdown />
      </div>
    </div>
  );
}
