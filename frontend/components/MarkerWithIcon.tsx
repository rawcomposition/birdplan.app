import Icon from "components/Icon";
import { markerIcons, MarkerIconT } from "lib/icons";
import clsx from "clsx";

type Props = {
  icon: MarkerIconT;
  darkIcon?: boolean;
  color?: string;
  className?: string;
  showStroke?: boolean;
  highlight?: boolean;
};

export default function MarkerWithIcon({ icon, darkIcon, color, showStroke = true, className, highlight }: Props) {
  const iconData = markerIcons[icon];
  if (!iconData) return null;
  return (
    <div
      className={clsx(
        "relative cursor-pointer shadow w-[25px] h-[25px] rounded-full inline-flex items-center justify-center",
        showStroke && "border-white border-2",
        className
      )}
      style={{
        backgroundColor: color ?? iconData.color,
      }}
    >
      {highlight && (
        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-white/80 rounded-full bg-white/70 -z-[1]" />
      )}
      <Icon name={iconData.icon} className={clsx("text-[13px]", darkIcon ? "text-gray-700" : "text-gray-100")} />
    </div>
  );
}
