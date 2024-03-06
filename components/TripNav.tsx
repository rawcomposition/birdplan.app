import React from "react";
import MapFlatIcon from "icons/MapFlat";
import Bullseye from "icons/Bullseye";
import Calendar from "icons/Calendar";
import clsx from "clsx";
import { useTrip } from "providers/trip";
import Link from "next/link";
import { useRouter } from "next/router";
import { useModal } from "providers/modals";
import TripOptionsDropdown from "components/TripOptionsDropdown";

const links = [
  { name: "Hotspots", slug: "", Icon: MapFlatIcon },
  { name: "Targets", slug: "targets", Icon: Bullseye },
  { name: "Itinerary", slug: "itinerary", Icon: Calendar },
];

type Props = {
  active: string;
};

export default function TripNav({ active }: Props) {
  const { trip } = useTrip();
  const { pathname } = useRouter();
  const { close } = useModal();

  React.useEffect(() => {
    close();
  }, [pathname]);

  return (
    <div className="flex gap-1.5 items-center flex-shrink-0 px-3 bg-[#1e263a] justify-start h-[52px]">
      {links.map(({ name, slug, Icon }) => (
        <Link
          href={`/${trip?.id}/${slug}`}
          key={slug}
          className={clsx(
            "flex items-center text-[14px] gap-2 font-medium justify-center rounded py-1 px-2.5",
            active === slug ? "bg-sky-600/80 text-white" : "hover:bg-white/10 text-gray-300"
          )}
        >
          <div className="hidden xs:block">
            <Icon />
          </div>
          {name}
        </Link>
      ))}
      <TripOptionsDropdown />
    </div>
  );
}
