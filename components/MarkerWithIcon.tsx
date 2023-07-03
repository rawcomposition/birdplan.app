import { MarkerIcon } from "lib/types";
import Hike from "icons/Hike";
import Star from "icons/Star";
import House from "icons/House";
import Airbnb from "icons/Airbnb";
import Campground from "icons/Campground";
import Bins from "icons/Bins";
import Airplane from "icons/Airplane";
import Boat from "icons/Boat";
import clsx from "clsx";

type Props = {
  icon: MarkerIcon;
  darkIcon?: boolean;
  color?: string;
  className?: string;
  showStroke?: boolean;
  highlight?: boolean;
};

const iconMap: Record<MarkerIcon, any> = {
  [MarkerIcon.HOTSPOT]: Star,
  [MarkerIcon.HOUSE]: House,
  [MarkerIcon.TENT]: Campground,
  [MarkerIcon.AIRBNB]: Airbnb,
  [MarkerIcon.BINS]: Bins,
  [MarkerIcon.HIKE]: Hike,
  [MarkerIcon.AIRPORT]: Airplane,
  [MarkerIcon.BOAT]: Boat,
};

const defaultColors: Record<MarkerIcon, string> = {
  [MarkerIcon.HOTSPOT]: "#0284c7",
  [MarkerIcon.HOUSE]: "#334155",
  [MarkerIcon.TENT]: "#b45309",
  [MarkerIcon.AIRBNB]: "#ff385b",
  [MarkerIcon.BINS]: "#0d9488",
  [MarkerIcon.HIKE]: "#15803d",
  [MarkerIcon.AIRPORT]: "#64748b",
  [MarkerIcon.BOAT]: "#0369a1",
};

export default function MarkerWithIcon({ icon, darkIcon, color, showStroke = true, className, highlight }: Props) {
  const Icon = iconMap[icon];
  return (
    <div
      className={clsx(
        "relative cursor-pointer shadow w-[25px] h-[25px] rounded-full inline-flex items-center justify-center",
        showStroke && "border-white border-2",
        className
      )}
      style={{
        backgroundColor: color || defaultColors[icon],
      }}
    >
      <Icon className={clsx("text-[13px]", darkIcon ? "text-gray-700" : "text-gray-100")} />
      {highlight && (
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-gray-600/90 rounded-full " />
      )}
    </div>
  );
}
