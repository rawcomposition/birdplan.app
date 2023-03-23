import { MarkerIcon } from "lib/types";
import Marker from "icons/Marker";
import Star from "icons/Star";
import House from "icons/House";
import Airbnb from "icons/Airbnb";
import clsx from "clsx";

type Props = {
  icon: MarkerIcon;
  darkIcon?: boolean;
  color?: string;
};

const iconMap: Record<MarkerIcon, any> = {
  [MarkerIcon.HOTSPOT]: Star,
  [MarkerIcon.HOUSE]: House,
  [MarkerIcon.TENT]: Marker,
  [MarkerIcon.AIRBNB]: Airbnb,
};

const defaultColors: Record<MarkerIcon, string> = {
  [MarkerIcon.HOTSPOT]: "#fac500",
  [MarkerIcon.HOUSE]: "#0369a1",
  [MarkerIcon.TENT]: "#4d7c0f",
  [MarkerIcon.AIRBNB]: "#ff385b",
};

export default function MarkerWithIcon({ icon, darkIcon, color }: Props) {
  const Icon = iconMap[icon];
  return (
    <div className="relative cursor-pointer -mt-[16px]">
      <Marker color={color || defaultColors[icon]} showStroke className="w-[24px] h-[32px]" />
      <Icon
        className={clsx(
          "absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[14px]",
          darkIcon ? "text-gray-700" : "text-gray-100"
        )}
      />
    </div>
  );
}
