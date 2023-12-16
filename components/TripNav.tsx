import MapFlatIcon from "icons/MapFlat";
import Bullseye from "icons/Bullseye";
import Calendar from "icons/Calendar";
import clsx from "clsx";
import { useTrip } from "providers/trip";
import Link from "next/link";

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
          <Icon />
          {name}
        </Link>
      ))}
    </div>
  );
}
