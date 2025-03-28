import React from "react";
import clsx from "clsx";
import { useTrip } from "providers/trip";
import Link from "next/link";
import { useRouter } from "next/router";
import { useModal } from "providers/modals";
import TripOptionsDropdown from "components/TripOptionsDropdown";
import Icon from "components/Icon";

const links = [
  { name: "Map", slug: "", icon: "mapFlat" },
  { name: "Targets", slug: "targets", icon: "bullseye" },
  { name: "Itinerary", slug: "itinerary", icon: "calendar" },
];

type Props = {
  active: string;
  border?: boolean;
};

export default function TripNav({ active, border = true }: Props) {
  const { trip } = useTrip();
  const { pathname } = useRouter();
  const { close } = useModal();

  React.useEffect(() => {
    close();
  }, [pathname]);

  return (
    <div className={clsx("bg-white px-2 pb-2 pt-0.5 h-[55px]", border && "border-b border-gray-100")}>
      <div className="flex gap-1.5 items-center flex-shrink-0 bg-slate-200/80 justify-start rounded-full px-2.5 py-2">
        {links.map(({ name, slug, icon }) => (
          <Link
            href={`/${trip?._id}/${slug}`}
            key={slug}
            className={clsx(
              "flex items-center text-[14px] gap-2 font-medium justify-center rounded-full py-1 px-2.5",
              active === slug ? "bg-sky-600 text-gray-100" : "hover:bg-slate-300 text-gray-600"
            )}
          >
            <Icon name={icon as any} className="!hidden xs:!inline" />
            {name}
          </Link>
        ))}
        <TripOptionsDropdown />
      </div>
    </div>
  );
}
