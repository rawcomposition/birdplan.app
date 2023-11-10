import MapFlatIcon from "icons/MapFlat";
import Bullseye from "icons/Bullseye";
import Calendar from "icons/Calendar";
import clsx from "clsx";
import Link from "next/link";

const links = [
  { name: "Map", slug: "", Icon: MapFlatIcon },
  { name: "Targets", slug: "targets", Icon: Bullseye },
  { name: "Itinerary", slug: "itinerary", Icon: Calendar },
];

type Props = {
  tripId: string;
  active: "" | "targets" | "itinerary";
};

export default function TripNav({ tripId, active }: Props) {
  return (
    <div className="flex gap-1.5 mb-4 mx-3 mt-4">
      {links.map(({ name, slug, Icon }) => (
        <Link
          key={slug}
          href={tripId ? `/${tripId}/${slug}` : ""}
          className={clsx(
            "flex items-center text-[14px] gap-2 font-bold w-full justify-center rounded py-1.5 px-3",
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
