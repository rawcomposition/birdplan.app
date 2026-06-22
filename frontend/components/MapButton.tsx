import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import useMediaQuery from "hooks/useMediaQuery";

type Props = {
  className?: string;
  type?: "submit" | "reset" | "button" | undefined;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
  active?: boolean;
  childItems?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  [x: string]: any;
};

export default function MapButton({
  className,
  disabled,
  type = "button",
  children,
  tooltip,
  active,
  childItems,
  ...props
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (!childItems?.length) {
    return (
      <button
        type={type}
        className={clsx(
          className,
          "w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg text-[20px] group relative",
          active ? "text-[#1172ab]" : "text-gray-700",
          disabled ? "opacity-60" : "hover:bg-gray-100"
        )}
        disabled={disabled}
        {...props}
      >
        {children}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={clsx(
          className,
          "group relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-[20px] shadow-lg",
          active ? "text-[#1172ab]" : "text-gray-700",
          disabled ? "opacity-60" : "hover:bg-gray-100"
        )}
      >
        {children}
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isDesktop ? "right" : "left"} align="start" sideOffset={8} className="w-auto min-w-[200px]">
        {childItems.map(({ label, onClick, icon }) => (
          <DropdownMenuItem key={label} onClick={onClick} className="gap-3 p-2.5 pl-5 text-[15px] text-gray-900">
            {icon}
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="absolute top-1/2 right-14 sm:left-14 sm:right-auto transform -translate-y-1/2 bg-black/80 text-white text-sm whitespace-nowrap px-2.5 py-1 rounded-lg hidden sm:group-hover:block">
      {children}
    </span>
  );
};
